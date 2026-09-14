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

## Jules 逾時介入（協調者必做）
使用者不監工 Jules。協調者必須在執行過長時主動觀察並介入：
- 派工後約 15–20 分鐘抽查一次狀態
- 約 25 分鐘無有意義進度 → 介入（sendMessage 解卡；鬼轉則開新 Session 並留下對照）
- 同一計畫步驟約 40 分鐘卡住（例如 npm install）→ 介入
- 使用者回報卡住 → 立刻介入
- 過程寫進 GitHub Issue；僅授權／重大取捨才找使用者

## 清理失敗／卡死舊任務（協調者必做）
介入或開新 Session 後，刪除已無交付價值的卡死／失敗舊 Jules Session（`DELETE /v1alpha/sessions/{id}`），Issue 留下舊→新對照；關閉無效 PR／廢分支。已完成且有效的 PR／Session 證據保留。
