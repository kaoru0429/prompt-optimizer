export function classifyIntent(userMessage) {
  if (!userMessage || typeof userMessage !== 'string') {
    return 'generic';
  }

  const message = userMessage.toLowerCase();

  const writingKeywords = ['文章', '貼文', '文案', '信件', '報導', '撰寫', '寫'];
  const planningKeywords = ['安排', '計畫', '企劃', '規劃', '活動', '專案', '行程'];

  for (const keyword of writingKeywords) {
    if (message.includes(keyword)) {
      return 'writing';
    }
  }

  for (const keyword of planningKeywords) {
    if (message.includes(keyword)) {
      return 'planning';
    }
  }

  return 'generic';
}
