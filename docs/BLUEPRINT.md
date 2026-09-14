# Blueprint（第一版）

## Spec／Schema
- **UserMessage**：使用者輸入的短需求（字串）  
- **Mode**：`single`（一則提示詞）｜`chain`（提示詞鏈）  
- **PromptArtifact**：  
  - `title`（短標題）  
  - `body`（可複製正文）  
  - 若 `chain`：`steps[]`，每步含 `name`、`prompt`  
- **ExpandResult**：一次回覆可含說明＋ artifact（們）

## Folder Tree／Architecture（示意）
- `src/ui/`：對話介面（輸入、訊息氣泡、複製按鈕、模式切換）  
- `src/expand/`：規則／模板擴寫邏輯（不依賴外部 API）  
- `src/templates/`：通用模板與擴寫規則資料  
- `tests/`：擴寫行為測試  
- `docs/`：Goal／Blueprint／Plans／日誌  

## Context／State
- **獨立**：單次對話中的訊息列表、目前 Mode、最近一次 ExpandResult（可先放瀏覽器記憶體）  
- **不共享寫入**：不同策略分支不得搶同一未合併主分支之產品行為假設  

## Bridge／Shared State
- 跨元件只透過 `ExpandResult`／`PromptArtifact` 形狀傳遞  
- 跨 Plan 變更 Schema 必須開 Integration／Merge Plan  
