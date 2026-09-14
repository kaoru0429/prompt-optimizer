export default {
  build(userMessage) {
    return {
      title: '逐步完成任務指南',
      body: `為了解決您的需求：「${userMessage}」，我們將分步驟進行。`,
      steps: [
        {
          name: '第一步：分析與規劃',
          prompt: `請分析以下需求並列出執行計畫：\n\n${userMessage}`
        },
        {
          name: '第二步：執行與產出',
          prompt: `請根據剛才的計畫，實際產出最終結果，確保品質符合專業標準。`
        }
      ]
    };
  }
};
