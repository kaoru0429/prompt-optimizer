export function generatePlanning(userMessage, mode) {
  if (mode === 'single') {
    return {
      title: '企劃與規劃提示詞',
      body: `請扮演一位資深的專案經理與企劃專家。

我需要一份完整的計畫，需求如下：
${userMessage}

請在你的計畫中包含：
1. 目標設定 (Objectives)
2. 預期效益 (Expected Outcomes)
3. 具體執行步驟 (Action Plan)
4. 所需資源與時程估算 (Resources & Timeline)
5. 潛在風險與應對措施 (Risks & Mitigations)

限制：
- 請確保計畫結構清晰、邏輯嚴密。
- 請使用繁體中文回覆。
`
    };
  } else if (mode === 'chain') {
    return {
      steps: [
        {
          name: '盤點目標與資源',
          prompt: `我需要進行一項規劃，需求如下：
${userMessage}

請先協助我釐清現況。請列出你需要知道的資訊，例如：
1. 具體可量化的目標為何？
2. 有哪些既有資源或限制條件（時間、預算、人力）？
3. 主要的利害關係人是誰？`
        },
        {
          name: '建立初步架構',
          prompt: `請根據我們先前討論的目標與資源條件，提出一份初步的計畫架構。

原始需求：
${userMessage}

架構應涵蓋主要階段、關鍵里程碑，以及建議的時程分配。`
        },
        {
          name: '細節完善與風險評估',
          prompt: `請根據目前的計畫架構，進一步展開具體的執行細節，並進行風險評估。

請提供：
1. 每個階段的具體行動清單。
2. 潛在風險分析與應對方案。
3. 最終整理成一份完整、專業的企劃書。`
        }
      ]
    };
  }
}
