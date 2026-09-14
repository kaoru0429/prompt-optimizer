# AGENTS.md — Canonical 規則

## 使用者邊界
使用者只處理：需求、必要授權、重大取捨、成果驗收。不搬 Prompt、不操作 Git、不催接力。

## 平台分工
| 平台 | 責任 |
|---|---|
| Grok Bot | 唯一入口；整理需求、Repo、派工、追蹤、比較 finalists、裁決、整合交付 |
| GPT Codex | 獨立提案；審查 Claude Code-origin；勝出時可任 Third Man |
| Claude Code | 獨立提案；審查 GPT Codex-origin；勝出時可任 Third Man |
| Jules Pro | 各策略隔離分支實作、測試、自我修正、證據與 PR／changeSet |

## 三層分開
1. 內容：Goal → Blueprint → Plan → Task  
2. 流程：雙方提案 → Jules → 交叉審查 → Grok 裁決 → 必要時 Third Man  
3. Repo：本檔、Skills、Issue／PR／CI  

禁止把流程縮成「只丟 Jules 趕工」而不經提案／交叉審查（除非使用者書面例外）。

## 完成標準（工程）
- 符合當前 Plan 的 Scope 與 Acceptance  
- 有測試或可重現驗證證據  
- GitHub 留下策略 origin、分支、審查、裁決與下一步  
