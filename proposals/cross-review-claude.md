# Independent Cross-Review: PLAN-001 (GPT-Codex origin)

**Finalist: X1 (PR #3)**

X1 is the clear pick. It is the only candidate that actually implements per-step and per-artifact copy buttons (with a secure/insecure-context fallback that matters for `http://localhost` and GitHub Pages), fully satisfying acceptance items 1–2. Its `expandPrompt()` output shape (`{ explanation, artifact: { title, body } }` for single mode, `{ explanation, artifact: { steps: [{ name, prompt }] } }` for chain mode) maps closely onto the Blueprint's `ExpandResult`/`PromptArtifact` schema, and its `node:test` suite runs with zero `npm install` (Node's built-in test runner + plain ESM), so the tests are guaranteed reproducible — unlike X2's Vitest suite, which was never actually installed or run. X2's `expandPrompt()` returns a bare template **string**, discarding the `explanation`/`artifact`/`steps[]` structure entirely and, more critically, its `App.jsx` has **no copy-to-clipboard affordance anywhere** — a direct failure of acceptance items 1 and 2. X2 is also smaller and trendier (Preact/Vite) but that buys nothing here since its build/test chain was never verified and its package.json ships a `test:e2e` script that references Playwright without the `@playwright/test` dependency. X1 is a bit more code (750 lines vs 277) but that's proportional to actually implementing the required UI affordances, not bloat.

## X1 vs X2 comparison table

| Criterion | X1 (PR #3) | X2 (PR #5) |
|---|---|---|
| 1. Copyable complete prompt | ✅ `.copy-btn` per single artifact, with secure/insecure fallback | ❌ No copy button anywhere in `App.jsx` |
| 2. Chain mode, steps ≥ 2, each copyable | ✅ 3 steps, `.copy-step-btn` per step + `.copy-all-btn` | ⚠️ 3 steps exist but only as text markers inside one string; no per-step object, no copy control at all |
| 3. zh-TW UI | ✅ `lang="zh-TW"`, all copy in Traditional Chinese | ✅ `lang="zh-TW"`, all copy in Traditional Chinese |
| 4. No API keys / local / GH Pages | ✅ zero-build static site, works from `index.html` directly | ⚠️ Requires Vite build step; deployable but needs a build pipeline configured (not shown in diff) |
| 5. Automated test on expand structure | ✅ `node:test`, asserts `artifact.title`, `artifact.steps[].name/prompt`, runs with no install | ⚠️ Vitest tests assert on a raw string (`toContain`), not structured shape; never actually run in this session (npm skipped) |
| Schema fidelity (ExpandResult/PromptArtifact) | ✅ close match; chain artifact omits top-level `title`/`body` (minor gap) | ❌ returns plain string, no `explanation` field, no `PromptArtifact` object at all |
| Test runnability | ✅ no dependency install needed | ❌ unverified; `test:e2e` script references missing `@playwright/test` |
| Deploy | ✅ trivial static hosting | ⚠️ needs `npm install && npm run build`, unverified in this review |

## X1 review

**Strengths**
- `src/expand/engine.js:1-33` returns exactly the `{ explanation, artifact }` shape the Blueprint calls for.
- `src/ui/app.js` implements clipboard copy three ways: whole single artifact, individual chain step, and "copy all steps" — directly satisfies acceptance items 1 and 2, including a `document.execCommand` fallback for non-secure (`http://`) contexts, which matters for local usage.
- Zero build step: `index.html` loads ESM directly, deployable to GitHub Pages by pointing at the repo root with no CI/build required.
- `tests/expand.test.mjs` uses Node's built-in `node:test`, requiring no `npm install`, and asserts on structural fields (`artifact.title`, `artifact.steps[i].name/prompt`), not just substring matches — this is real structural validation, not just string-contains.
- Templates (`generic.js`, `writing.js`, `planning.js`) are separated into `src/templates/` per the folder intent.

**Gaps / schema notes**
- Chain-mode artifacts (`src/templates/*.js`, `mode === 'chain'` branches) return only `{ steps: [...] }` with no `title`/`body`, while the Blueprint literally lists `title`, `body` as base `PromptArtifact` fields with `steps[]` layered on for chain mode. `src/ui/app.js:appendAiMessage` currently detects mode by checking `result.artifact.title && result.artifact.body` vs `result.artifact.steps`, which works today but is a duck-typed branch rather than an explicit `mode` field on the result — a downstream consumer expecting `artifact.title` unconditionally would break on chain results.
- No `package.json`/README in the diff — nothing documents how to run `node --test tests/` or serve the site locally, which weakens the "dev process leaves evidence" spirit even though it isn't a strict acceptance item.
- `classifyIntent` (`src/expand/classifier.js`) keys off the single character `寫` as a writing keyword, which will match almost any message containing that substring (e.g. "幫我安排寫作計畫" hits both writing and planning keyword sets, and since writing is checked first, planning-flavored messages describing writing will misclassify as pure "writing"). Not a hard bug given "optimality" is explicitly non-acceptance, but worth tightening.
- `generateGeneric/Writing/Planning(userMessage, mode)` return `undefined` if `mode` is anything other than `'single'`/`'chain'` (no `else` branch); `app.js` would then throw on `result.artifact.title` since `artifact` is `undefined`. Currently unreachable via the UI (radios only emit those two values), but it's a silent landmine for future callers.

## X2 review

**Strengths**
- Cleaner component code (Preact) and JSON-based templates (`src/templates/templates.json`) are easy to read/extend.
- `identifyIntent`/`expandPrompt` unit tests (`tests/expand.test.js`) are reasonably targeted at the classifier logic.
- zh-TW copy and mode toggle UI text are present and correct.

**Gaps / schema notes**
- **Critical:** `src/expand/index.js:expandPrompt` returns a plain string (`template.replace(...)`), not an `ExpandResult`. There is no `explanation` field and no `PromptArtifact { title, body }` / `{ steps: [{name, prompt}] }` object anywhere in the data flow — `App.jsx` just shoves the string into `messages` state as `content`. This is a full break from the Blueprint's bridge contract ("components pass ExpandResult / PromptArtifact shapes only").
- **Critical:** No copy-to-clipboard functionality exists in `App.jsx` at all — fails acceptance items 1 and 2 outright, regardless of schema concerns.
- Chain-mode "steps" are just `【步驟 1/3：...】` markers baked into one string, not discrete `{name, prompt}` objects — so even if copy buttons were added, per-step copy would require re-parsing the string rather than iterating structured data.
- `package.json` lists `"test:e2e": "playwright test"` but no `@playwright/test` (or `playwright`) dependency — that script cannot run as shipped.
- npm install/test were explicitly skipped for this candidate, so none of `vite build`, `vitest run`, or the dev server have been verified to actually work in this state.

## Change suggestions for the finalist (X1)

### P0 (must-fix before merge)
- Normalize the artifact shape so chain-mode results also carry `title`/`body` (e.g., a synthesized title like "提示詞鏈：{n} 個步驟" and a `body` summary), or explicitly add a `mode`/`kind` discriminant field to `ExpandResult`/`PromptArtifact` instead of relying on `artifact.title` vs `artifact.steps` duck-typing in `src/ui/app.js`. This is the one real schema-fidelity gap against the Blueprint.
- Guard `generateGeneric/Writing/Planning` against unexpected `mode` values (throw or default to `'single'`) instead of silently returning `undefined`, since `app.js` will crash with an unguarded `.title` access otherwise.
- Add a test for the `planning` intent in chain mode (`tests/expand.test.mjs` currently only covers `generic` and `writing` chain cases) so all three templates are verified for structural validity, matching acceptance item #5 in full.

### P1 (should-fix, not blockers)
- Add a minimal `package.json`/README documenting `node --test tests/` and how to serve `index.html` locally / deploy to GitHub Pages — supports the "dev process leaves evidence" spirit and onboarding.
- Tighten `classifyIntent` keyword lists (e.g., drop the bare `寫` in favor of more specific compounds) to reduce cross-category false positives; document the ordering (writing checked before planning) as an intentional priority rule.
- Add `aria-live="polite"` to `.copy-status` elements for accessibility on copy confirmation.
- Consider a lightweight GitHub Actions workflow to run `node --test tests/` on PRs, since none exists yet and the suite is cheap to run.

```json
{"reviewer":"claude-code","reviewed_origin":"gpt-codex","candidates":["X1","X2"],"finalist":"X1","pr":3,"suggestions":["Add title/body (or explicit mode discriminant) to chain-mode PromptArtifact instead of duck-typing on artifact.steps vs artifact.title","Guard template generators against unexpected mode values to avoid undefined artifact crashing app.js","Add planning-intent chain-mode test coverage","Add package.json/README with run and deploy instructions","Tighten classifyIntent keyword overlap (e.g. bare 寫 keyword) to reduce misclassification","Add aria-live to copy-status elements for accessibility","Add a CI workflow to run node --test on PRs"],"p0":["Normalize/discriminate chain vs single PromptArtifact shape per Blueprint","Guard against undefined artifact when mode is unexpected","Add missing planning-intent chain-mode test"],"p1":["Add package.json/README for run+deploy instructions","Tighten classifier keyword precision","Add aria-live to copy status UI","Add CI workflow for tests"],"summary":"X1 (PR #3) is the stronger PLAN-001 candidate: it implements full copy functionality (single artifact, per-step, and copy-all) with a secure/insecure-context fallback, returns an ExpandResult shape that closely matches the Blueprint schema, ships a dependency-free node:test suite that actually runs and asserts on structure, and deploys as a zero-build static site suitable for GitHub Pages or local use. X2 (PR #5) fails acceptance items 1-2 outright because its App.jsx has no copy-to-clipboard mechanism at all, its expandPrompt() collapses the ExpandResult/PromptArtifact contract into a single opaque string with no explanation or structured steps, and its Vitest/Playwright test setup was never verified to install or run. X1's remaining issues are schema-consistency and robustness polish (chain artifacts lacking title/body, no guard for unexpected mode values, missing planning-intent chain test) rather than fundamental acceptance failures, making it the safer merge target with a short, well-scoped punch list."}
```
