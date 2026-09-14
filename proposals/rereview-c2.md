# PLAN-001 C2 re-review after repair round 1

**Target:** C2 — repair PR #7 (prior PR #4). **Reviewer:** gpt-codex (Codex CLI). **Verdict: PASS** — ready for Grok adjudication vs X1. Do not merge.

Executor verification (this session): `npm ci` + `npm run test:unit` (2/2 PASS; Vitest scoped to unit only) + `npm run build` PASS on PR #7 head tree. Playwright E2E not executed here.

---

**Verdict: PASS** — PR #7 closes both prior P1 findings: `package.json` replaces the failing placeholder, and `vite.config.js` isolates unit-test discovery. The supplied executor evidence confirms two unit tests and the production build pass. `src/ui/App.jsx`, `src/ui/ChatWindow.jsx`, and the templates preserve acceptance 1–5, with no identified P0 blocker or core regression. Browser execution remains unverified, and the CI, clipboard-failure test, and accessibility suggestions are only partially complete. C2 is ready for Grok adjudication against X1.

## Prior P1 status

1. **FIXED — Failing default test placeholder.** `package.json:10` now intentionally composes `test:unit` and `test:e2e`. The unit portion passed; the complete `npm test` command is not verified because Playwright was not executed.
2. **FIXED — Vitest discovers Playwright tests.** `vite.config.js:8` restricts discovery to `tests/unit/**/*.test.js`. Executor evidence confirms only `tests/unit/expand.test.js` was discovered: one file, two passing tests.

## Prior P2 / suggestion status

1. **FIXED — Supported Node declaration and command documentation.** `package.json:25` declares the locked Vitest-compatible Node range; `README.md:10–16` documents prerequisites and installation, development, test, build, and preview commands. CI selects Node 22. An exact runtime pin and local Playwright installation instructions remain optional documentation improvements.

2. **PARTIAL — Expanded E2E coverage.** `tests/e2e/chat-flow.spec.ts` clicks the single and both step copy buttons, compares clipboard contents exactly against displayed prompts, and switches modes within one conversation. However, `clearPermissions()` at line 97 resets permission overrides; it does not explicitly force `writeText` to reject. The failure case needs deterministic rejection or explicit denial. No E2E execution evidence is available.

3. **PARTIAL — CI and production browser smoke.** `.github/workflows/ci.yml` installs dependencies/browser prerequisites and runs unit tests, build, and E2E. Its `main`-only branch filters exclude PR #7’s supplied feature-branch target and feature-branch pushes. `playwright.config.js:20–23` still serves `npx vite` at `/`, so browser tests do not validate built output or a project subpath.

4. **PARTIAL — Favicon, localized feedback, accessibility, and scrolling.** `index.html` removes the missing favicon; `src/ui/CopyButton.jsx:30` adds Traditional Chinese failure feedback; `src/ui/App.jsx:13–19` adds scrolling. `src/ui/ModeToggle.jsx` exposes selected radio state, but lacks radio-group arrow-key navigation and focus management. The wish input at `src/ui/App.jsx:47–54` still has only a placeholder, without an explicit label.

## Acceptance re-check

1. **PASS by source inspection.** `App.jsx` submits wishes to `src/expand/classify.js`; the single template produces a complete prompt, and `ChatWindow.jsx` binds its body to `CopyButton`. Clipboard execution is unverified.
2. **PASS by source and unit evidence.** The chain template supplies two named steps; `ChatWindow.jsx` provides a copy button for each step. Unit tests verify the minimum step count and fields.
3. **PASS by source inspection.** Application-authored UI and template text are Traditional Chinese, including copy-failure feedback. English console diagnostics are not rendered UI.
4. **PASS by architecture and build evidence.** Expansion uses local templates without keys or external services. `vite.config.js` uses `base: './'`, and the production build passed. Hosted subpath operation remains browser-unverified.
5. **PASS, executor-verified.** `tests/unit/expand.test.js` contains two passing tests checking single/chain output structure, wish inclusion, and chain step fields/count.

## Remaining issues

**P0:** None.

**P1 — nonblocking follow-ups under the supplied verdict rules:**

- Make clipboard-failure testing deterministic in `tests/e2e/chat-flow.spec.ts:95–105`, then execute the browser suite.
- Extend `.github/workflows/ci.yml` coverage to the finalist branch workflow and test built output under a project subpath through `playwright.config.js`.
- Add an explicit wish-input label in `src/ui/App.jsx` and complete keyboard behavior for the radio group in `src/ui/ModeToggle.jsx`.

```json
{"reviewer":"gpt-codex","target":"C2","pr":7,"prior_pr":4,"verdict":"PASS","remaining_p0":[],"remaining_p1":["Make clipboard-failure testing deterministic and execute the browser suite.","Extend CI coverage to the finalist branch workflow and smoke-test built output under a project subpath.","Add an explicit wish-input label and complete mode radio-group keyboard behavior."],"summary":"PR #7 fixes both prior P1 test-entry and discovery defects. Supplied executor evidence confirms two unit tests and the production build pass; source inspection supports acceptance 1–5 without a core regression. E2E execution remains unverified, clipboard failure is not deterministically induced, CI excludes the current feature-branch target and tests the development server, and accessibility polish remains incomplete. These are nonblocking follow-ups; C2 is ready for Grok adjudication against X1."}
```