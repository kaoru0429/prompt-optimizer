# CI 工作流佔位

本 Repo 的 GitHub token 若缺少 `workflow` 權限，無法直接推 `.github/workflows/*.yml`。

請在 GitHub → Settings → Actions 允許後，把下列內容存成 `.github/workflows/ci.yml`，或授權具 workflow scope 的 `grok-bot` PAT 後由協調者重推。

```yaml
name: ci

on:
  push:
    branches: [main]
  pull_request:

jobs:
  placeholder:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Scaffold check
        run: |
          test -f AGENTS.md
          test -f docs/GOAL.md
          test -f docs/BLUEPRINT.md
          test -d src
          test -d tests
          echo "Scaffold OK (product tests added by strategy PRs)"
```
