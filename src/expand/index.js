import templates from '../templates/templates.json';

/**
 * Identify intent based on keyword matching
 * @param {string} input - User input string
 * @returns {string} - Intent category ('code', 'write', or 'default')
 */
export function identifyIntent(input) {
  const codeKeywords = ['寫程式', '開發', '程式碼', '系統', '架構', '軟體', '遊戲', 'app', '網頁', 'code'];
  const writeKeywords = ['寫文章', '文案', '故事', '心得', '報告', '信件', '作文'];

  const lowerInput = input.toLowerCase();

  for (const keyword of codeKeywords) {
    if (lowerInput.includes(keyword)) {
      return 'code';
    }
  }

  for (const keyword of writeKeywords) {
    if (lowerInput.includes(keyword)) {
      return 'write';
    }
  }

  return 'default';
}

/**
 * Expand simple prompt to optimized prompt based on mode and intent
 * @param {string} input - User's simple prompt
 * @param {string} mode - 'single' or 'chain'
 * @returns {string} - Optimized prompt
 */
export function expandPrompt(input, mode = 'single') {
  const intent = identifyIntent(input);

  // Safeguard: Ensure valid mode and intent
  const safeMode = templates[mode] ? mode : 'single';
  const safeIntent = templates[safeMode][intent] ? intent : 'default';

  const template = templates[safeMode][safeIntent];

  // Replace placeholder with actual input
  return template.replace(/\{\{input\}\}/g, input);
}
