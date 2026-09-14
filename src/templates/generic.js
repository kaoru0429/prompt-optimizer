export function generateGeneric(userMessage, mode) {
  if (mode === 'single' || (mode !== 'chain')) {
    return {
      kind: 'single',
      title: '通用任務提示詞',
      body: `請扮演一位專業的 AI 助理。

你的任務是：
${userMessage}

限制：
- 請確保回答完整且具邏輯。
- 請使用繁體中文回覆。
`
    };
  } else if (mode === 'chain') {
    return {
      kind: 'chain',
      title: '通用任務提示詞 (提示詞鏈)',
      body: '此為分步驟執行的提示詞鏈，請參考下方步驟。',
      steps: [
        {
          name: '釐清需求',
          prompt: `請分析以下需求並列出需要釐清的問題，以幫助我提供更精確的指示。

原始需求：
${userMessage}

請列出 3-5 個關鍵問題。`
        },
        {
          name: '產出草稿',
          prompt: `請根據我們先前討論與釐清的內容，針對以下需求產出初步的草稿或方案。

原始需求：
${userMessage}

請確保內容完整且具備實作可行性。（如果上方有任何你需要釐清的回答，請一併考量）`
        },
        {
          name: '檢查修訂',
          prompt: `請根據產出的草稿，進行最後的審查與修訂。請檢查以下項目：
1. 是否完全符合原始需求？
2. 語氣是否適當？
3. 是否有邏輯不連貫的地方？

請直接輸出修訂後的最終版本。`
        }
      ]
    };
  }
}
