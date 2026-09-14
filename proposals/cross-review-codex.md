# PLAN-001 independent cross-review

**Finalist: C2 — PR #4.** Reviewer: gpt-codex. Reviewed origin: claude-code.

C2 has the stronger maintainable implementation and acceptance coverage: separate UI components, an explicit template registry, unit tests plus browser-flow tests, and a static build configured for relative asset paths. Its broken default test script and unscoped unit discovery need correction. This selection is not a claim that its build or E2E suite passed here, and is not merge approval.

## Scope and verification

Reviewed both supplied source trees, PLAN-001, and the included PR diffs. The diffs establish that C1's `server.log` is committed junk, while C2 actually includes `package-lock.json` even though it was omitted from the extracted tree. The review snapshot files `pr2.diff` and `pr4.diff` are not treated as implementation junk. Process evidence is meta and has no effect on code pass/fail. No candidate code was changed and nothing was merged.

Executed on Node 20.19.2 / npm 9.2.0:

- C1: `npm test` passed (the test file contains three cases: single, chain, and missing templates).
- C2: `npm test` exited 1 with its deliberate “no test specified” placeholder. `test:unit`, `build`, and `test:e2e` could not start because dependencies were absent.
- Copied C2 into `/tmp`, reconstructed its committed lockfile from the diff, and attempted dependency installation. Offline installation failed with ENOTCACHED; a network attempt failed with EAI_AGAIN. npm also reported that locked Vitest 5 requires Node `^22.12.0 || ^24.0.0 || >=26.0.0`, excluding this environment. These limitations are not evidence that C2's application build is broken.
- Independently imported C2's actual `classify` function with Node assertions: both modes passed nonempty explanation/title/body checks, wish inclusion, and chain step count/name/prompt checks. This corroborates the engine contract but does not substitute for running its committed Vitest suite.
- Reproduced C1's replacement-string corruption directly. A mocked HTTP/filesystem harness also confirmed that its server passes a parent-directory request to `fs.readFile` outside its static root; no private files were read.

No browser execution or deployed Pages URL was verified. UI acceptance below distinguishes source evidence from executed tests.

## C1 — PR #2

| PLAN-001 item | Verdict | Evidence |
| --- | --- | --- |
| 1. Simple wish → copyable full prompt | PASS for ordinary input | `src/ui/app.js` calls `expand`; `components.js` copies `artifact.body`; engine tests pass. Special replacement tokens are defective, as described below. Clipboard execution was not browser-tested. |
| 2. Chain mode, ≥2 steps, each copyable | PASS | Two JSON steps; passing engine assertions; renderer creates a copy button bound to each `step.prompt`. |
| 3. Traditional Chinese UI throughout | FAIL on error path | Normal UI is Traditional Chinese, but missing templates produce visible `發生錯誤：No templates provided` (`app.js:41`, `engine.js:46`). |
| 4. No keys; local/static operation | PASS | No model API or credentials; relative ESM and JSON URLs support HTTP static hosting, including a project subdirectory. Direct `file://` opening is not the supported model. Local server has a separate P1 defect. |
| 5. Automated ExpandResult structure test | PASS, executed | `tests/expand.test.js` verifies explanation, title/body, and chain step fields/count. |
| 6. Process evidence | META / excluded | Not a code acceptance gate. |

Schema/folders: compliant with the supplied `artifact(s)` allowance. C1 returns `{ explanation, artifact }` with title/body and chain name/prompt fields; its renderer consumes that shape consistently. All required folders exist. Singular `artifact` alone is not consumer-breaking schema drift under this baseline.

### Findings

**P0:** None found.

**P1 — Local server escapes its document root.** `server.cjs:14–22` concatenates `req.url` into a filesystem path without containment checks. A raw `/../package.json` request resolves to the parent directory's file. `listen(PORT)` at line 38 does not restrict binding to loopback. If reachable, this exposes readable files outside the intended site. Replace the helper with a maintained static server or enforce parsed-path containment and loopback binding. This is specific to the provided server, not GitHub Pages.

**P1 — User input is interpreted as replacement syntax.** `src/expand/engine.js:33` passes the wish as the replacement string to `String.replace`. Reproduction: `請解釋 $& 和 $$` becomes `請解釋 {{slot}} 和 $`. This corrupts technical wishes in single bodies and chain prompts. Use a replacement callback returning the literal input, with regression cases for replacement tokens.

**P2 — Startup and error handling undermine localization/recovery.** `src/ui/app.js:7–16,48–56` does not check response status, catches initialization errors without recovery, and attaches send handlers only after fetch completion despite presenting an enabled button. After failure it can clear a wish and expose the English engine error. Add a localized loading/error state, retry, and retained input.

**P2 — Copy failures and accessibility lack coverage.** `components.js` has no clipboard rejection handling; hidden radio inputs (`index.html`, `display: none`) prevent keyboard focus on mode controls. Add visible Traditional Chinese copy failure feedback, accessible mode controls, and browser tests that actually click each copy button and assert the payload.

**P2 — Repository hygiene and preview evidence.** The PR diff commits `server.log`. Remove and ignore runtime logs. No browser test or deployment workflow is supplied; static compatibility is supported by source paths, not a verified deployment.

### Strengths

Dependency-free runtime and tests; clear separation of engine/UI/JSON templates; useful literal data templates; working default test command; relative static URLs; user content is rendered with `textContent`; second chain step repeats the wish and preserves task context.

## C2 — PR #4

| PLAN-001 item | Verdict | Evidence |
| --- | --- | --- |
| 1. Simple wish → copyable full prompt | PASS by source and engine probe | `App.jsx` submits to `classify`; `ChatWindow.jsx` renders and binds body copy; Playwright covers submission/rendering. Actual clipboard transfer remains unverified. |
| 2. Chain mode, ≥2 steps, each copyable | PASS by source and engine probe | Two named prompts; one `CopyButton` per step; E2E asserts two cards and two copy buttons. |
| 3. Traditional Chinese UI throughout | PASS | App text, templates, mode labels, and copy feedback are Traditional Chinese; English console diagnostics are not rendered UI. |
| 4. No keys; local/static operation | PASS by architecture/configuration | Local template expansion; Vite build script and `base: './'`. Build output and deployed Pages operation were not executed here. |
| 5. Automated ExpandResult structure test | PASS for supplied test coverage, execution qualified | Two Vitest cases cover result/artifact/step structure; independent Node assertions pass. Repository test entry points require repair; committed suite not executed here. |
| 6. Process evidence | META / excluded | Not a code acceptance gate. |

Schema/folders: compliant. `{ explanation, artifacts: [artifact] }` matches the supplied plural allowance and the UI consumer. All required folders exist. JS templates are not prohibited by the supplied schema. Mode is consistently `single`/`chain`; no unsupported requirement for a mode field in ExpandResult is imposed.

### Findings

**P0:** None found.

**P1 — Default test command always fails.** `package.json:10` still contains the npm-init failure placeholder. Confirmed by execution. Point `npm test` at a working unit gate, with E2E separately named or composed intentionally.

**P1 — Unit and browser test discovery are not isolated.** `package.json:11` runs bare `vitest run`; `vite.config.js` has no test inclusion/exclusion configuration. The Playwright file is named `tests/e2e/chat-flow.spec.ts`, which falls within normal Vitest spec discovery and imports Playwright's runner. This creates a runner-conflict risk for `test:unit`; scope Vitest to `tests/unit/**/*.test.js`. This finding is based on configuration/source inspection, not a reproduced Vitest failure in this environment.

**P2 — Toolchain prerequisite is undeclared.** The committed lockfile requires a newer Node version for Vitest than this environment provides. Add a compatible `engines.node` declaration and pin/document a supported Node version for contributors and CI; retain the committed lockfile. Do not misdiagnose its absence from the extracted snapshot as absence from PR #4.

**P2 — E2E verifies controls, not copying or production hosting.** `tests/e2e/chat-flow.spec.ts:21–23,41–43` only checks button visibility/count. `playwright.config.js` serves the Vite development server. Click the single button and every step button, assert exact clipboard payloads, cover denied clipboard access, and run a smoke test against built output under a project subpath. No deployment workflow or passing build artifact was supplied.

**P2 — Missing favicon and usability polish.** `index.html:5` references absent `/vite.svg`, an absolute URL unaffected by the relative JS asset strategy. Remove or replace it with a real relative asset. `CopyButton.jsx` only logs failures; show a localized error/manual-copy path. Add input labels and selected-state semantics to the mode buttons. The scrollable chat container does not automatically reveal new responses after a long conversation.

### Strengths

Small, independently understandable UI components; dedicated template registry; explicit ExpandResult JSDoc; plural artifact rendering; user input interpolated literally; no asynchronous template fetch startup dependency; browser tests exercise both modes; committed lockfile and generated-output ignores; explicit relative-base production build configuration.

## Decision and concrete finalist changes

Choose **C2 (PR #4)**. Its browser test source and static build configuration provide broader acceptance coverage than C1, although neither a successful E2E run nor a static build was verified here. C2 also avoids C1's reproduced wish corruption, unsafe custom server, committed runtime log, and visible English error path. Its component boundaries and registry make the next template/UI changes easier to maintain. C1's working zero-dependency tests are a real advantage, but do not outweigh these defects. C2's test-script defects count against it and must not be hidden by the finalist selection.

Recommended C2 changes, in order:

1. Replace the failing `npm test` placeholder; scope Vitest to unit tests and keep Playwright discovery separate. Verify both commands on the declared Node version.
2. Declare/pin a Node version supported by locked Vitest; document `npm ci`, development, test, build, and preview commands.
3. Extend browser tests to verify exact single/step clipboard writes, failure feedback, and switching modes within one conversation.
4. Add a CI gate for unit tests, production build, and browser smoke testing of built output at a project subpath; configure Pages publication if desired.
5. Remove the missing `/vite.svg` reference; add localized copy failure feedback, accessible input/mode semantics, and scroll-to-latest behavior.

No fixes implemented; no merge performed.
