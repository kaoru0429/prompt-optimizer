Based on the repo's `docs/GOAL.md`, `docs/BLUEPRINT.md`, and `docs/plans/PLAN-001-v1-chat.md`, here are three materially different implementation strategies for PLAN-001.

## Strategy A — Vanilla Zero-Build + JSON Rule Templates + Node Unit Tests

**Approach:** A plain static site with no build step and no framework: hand-written HTML/CSS and browser-native ES modules loaded directly via `<script type="module">`. All expansion logic is data-driven — templates live as JSON files describing trigger keywords, a title pattern, a body pattern with `{{slot}}` placeholders, and (for chain mode) an ordered `steps[]` array of `{name, promptTemplate}`. The expand engine is a small, pure JS function: score the user's message against each template's keyword list, pick the best match (or a generic fallback template), then do straight string substitution to fill placeholders and produce a `PromptArtifact`. Because the engine is a pure ESM module with zero DOM dependencies, it can be `import`-ed directly into a Node test file.

**Folder layout:**
```
index.html
src/ui/app.js          # DOM wiring: chat log, input, mode toggle, copy buttons
src/ui/components.js    # tiny render helpers (message bubble, copy button)
src/expand/engine.js     # matchTemplate(), fillTemplate(), buildResult()
src/templates/single/*.json
src/templates/chain/*.json
tests/expand.test.js     # node:test + assert
docs/
```

**Expand engine:** Keyword-scoring matcher over JSON templates → placeholder substitution → returns `{explanation, artifact}` matching the `ExpandResult` schema. No branching logic beyond scoring and substitution; all "intelligence" is authored as data.

**Test plan:** Node's built-in `node:test` + `assert` (no browser, no bundler needed) importing `engine.js` directly. Assertions: given sample wishes, single-mode output has non-empty `title`/`body`; chain-mode output has `steps.length >= 2` and each step has non-empty `name`/`prompt`. Run via `node --test tests/`.

**Risks:** Browser ESM import paths must stay relative (no bare specifiers) since there's no bundler to resolve `node_modules`; JSON-only templates cap expressiveness (no conditionals/loops without inventing a mini-syntax on top, which risks scope creep); manual DOM code (no framework) means more boilerplate for reactive UI state (mode switch, message list re-render).

**Why different:** No framework, no build tool, templates are pure declarative data, tests run in Node without touching a browser at all. This is the lowest-dependency, most auditable option — good fit for "multi-platform flow exam" since any platform with a browser or Node can run it unmodified.

## Strategy B — Preact + Vite Build + JS-Module Templates + Vitest & Playwright

**Approach:** A component-based UI using Preact (React-like API, ~3KB) built with Vite for dev server + production bundle. Components: `ChatWindow`, `MessageBubble`, `ModeToggle`, `CopyButton`, state held in Preact hooks (`useState`) for message history, current mode, and last `ExpandResult`. Templates are authored as JS modules, each exporting a function `build(userMessage) -> PromptArtifact`, which allows real logic (conditionals, composing sub-templates, deriving step count from the wish) rather than flat substitution. An "intent classifier" module scores the wish against a registry of template modules and picks the best one; for chain mode, a template module can itself call into 2+ smaller step-builder functions.

**Folder layout:**
```
index.html
vite.config.js
src/ui/App.jsx, ChatWindow.jsx, ModeToggle.jsx, CopyButton.jsx
src/expand/classify.js   # scores wish against template registry
src/expand/registry.js   # maps intent -> template module
src/templates/single/*.js
src/templates/chain/*.js
tests/unit/expand.test.js       # Vitest
tests/e2e/chat-flow.spec.ts     # Playwright
docs/
```

**Expand engine:** `classify(userMessage)` picks a template module from `registry.js`; the module's `build()` function runs arbitrary JS to assemble the `PromptArtifact`/`steps[]`. More expressive than Strategy A but the logic is now code, not data — changing behavior means editing JS, not JSON.

**Test plan:** Two layers. Vitest unit tests hit `classify`/`build` directly (fast, no browser) for structural assertions (same as Strategy A). Playwright smoke test runs against `vite preview` output: types a wish into the real UI, clicks send, asserts a copy button and non-empty prompt render, toggles to chain mode, asserts ≥2 step cards each with their own copy button. This is the only strategy that verifies the *actual rendered UI*, not just the engine's return value.

**Risks:** Adds a real toolchain (Vite, Preact, Playwright browser install) — more moving parts to keep green in CI, and Playwright is the heaviest/slowest piece to run on every commit; a framework dependency (even a small one) is something to track for updates; template-as-code is easier to make expressive but easier to accidentally introduce non-declarative side effects or inconsistent output shapes across templates.

**Why different from A:** framework instead of vanilla, a build step instead of zero-build, templates as executable code instead of declarative JSON, and adds a real browser-level E2E test on top of unit tests — directly exercises the "does clicking copy actually work" question that Strategy A's tests never touch.

## Strategy C — Lit Web Components + Zero-Build ESM (CDN/import maps) + Custom Template DSL + Browser-Native Test Runner

**Approach:** Custom elements built with Lit, loaded with no bundler at all — Lit is pulled in via an `<script type="importmap">` pointing at a CDN (or a vendored single file for offline/Pages use), so there's still zero local build step but the UI is componentized (`<chat-window>`, `<mode-toggle>`, `<prompt-card>` with a `<copy-button>` shadow-DOM part). Templates are written in a small custom DSL — plain `.tmpl` text files with `{{slot}}` placeholders plus lightweight `{{#if hasContext}}...{{/if}}` conditional blocks — parsed at runtime by a hand-rolled ~50-line parser. This sits deliberately between Strategy A's flat JSON substitution and Strategy B's full JS templates: more expressive than raw placeholder-fill, but still declarative and non-Turing-complete (auditable by non-engineers, per the Goal doc's "小白" audience).

**Folder layout:**
```
index.html                # importmap + <chat-window>
src/ui/chat-window.js, mode-toggle.js, prompt-card.js   # Lit components
src/expand/dsl-parser.js   # parseTemplate(), renderTemplate()
src/expand/engine.js       # match wish -> template -> render
src/templates/single/*.tmpl
src/templates/chain/*.tmpl
tests/browser/expand.test.js   # @web/test-runner + assert
web-test-runner.config.js
docs/
```

**Expand engine:** `dsl-parser.js` compiles a `.tmpl` file into a small AST (text nodes, slots, conditional blocks) once; `engine.js` matches the wish to a template file (same keyword-scoring idea as Strategy A) and renders the AST with the wish's extracted values into a `PromptArtifact`.

**Test plan:** `@web/test-runner` (runs tests inside a real headless browser via Playwright/Puppeteer launcher, but needs no separate bundler or Node-only mocking) exercising both the DSL parser directly (structural assertions on parsed output) and the custom elements' rendered shadow DOM (query for copy buttons, step cards) — a middle ground between Strategy A's pure-Node tests and Strategy B's separate unit/E2E split, since here "unit" and "browser" collapse into one runner.

**Risks:** Custom DSL is bespoke — any parser bug or unsupported syntax is entirely on this project to fix (no community docs/issues to lean on, unlike Handlebars or similar); relying on a CDN import map is a hazard for a static-Pages/offline deploy unless the Lit build is vendored into the repo, which then defeats some of the "zero install" appeal; Web Components' shadow DOM can complicate simple things like copy-button styling and testing (need `shadowRoot` queries).

**Why different from A and B:** framework choice is Web Components (platform-native, not a rendering library like Preact), the build model is zero-build like A but with CDN/import-map wiring instead of plain relative-only scripts, the template layer is a genuine custom DSL (distinct from both A's flat JSON and B's JS-code templates), and the test runner executes inside a real browser for everything (no Node-only test layer at all).

---

All three satisfy the shared constraints from Blueprint/PLAN-001 unchanged: Traditional Chinese UI copy, no external API keys, `UserMessage`/`Mode`/`PromptArtifact`/`ExpandResult` schema conformance, and static-file deployability to GitHub Pages. They differ on the three axes PLAN-001 asked to vary: UI approach (vanilla DOM / Preact+Vite / Lit web components), template representation (JSON data / JS functions / custom DSL), and test strategy (Node-only / split unit+Playwright / unified browser test runner) — each buildable independently on its own branch.
