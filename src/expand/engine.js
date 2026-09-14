/**
 * Match a user message against a list of templates based on keywords.
 * Returns the best matching template, or the first one if no keywords match.
 */
function matchTemplate(userMessage, templates) {
  if (!templates || templates.length === 0) return null;

  let bestMatch = templates[0];
  let highestScore = 0;

  for (const template of templates) {
    let score = 0;
    if (template.keywords) {
      for (const keyword of template.keywords) {
        if (userMessage.includes(keyword)) {
          score++;
        }
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = template;
    }
  }

  return bestMatch;
}

/**
 * Fills a template string with the user's message, replacing {{slot}}.
 */
function fillTemplate(templateStr, userMessage) {
  return templateStr.replace(/\{\{slot\}\}/g, userMessage);
}

/**
 * Expand a user's wish into an ExpandResult containing a PromptArtifact.
 * @param {string} userMessage - The short wish.
 * @param {string} mode - 'single' | 'chain'
 * @param {Array} templates - The list of available templates for this mode.
 * @returns {object} The ExpandResult.
 */
export function expand(userMessage, mode, templates) {
  const template = matchTemplate(userMessage, templates);
  if (!template) {
    throw new Error('No templates provided');
  }

  const artifact = {
    title: template.title,
    body: fillTemplate(template.body, userMessage)
  };

  if (mode === 'chain') {
    artifact.steps = (template.steps || []).map(step => ({
      name: step.name,
      prompt: fillTemplate(step.promptTemplate, userMessage)
    }));
  }

  return {
    explanation: `已根據您的需求擴寫為${mode === 'chain' ? '提示詞鏈' : '單一提示詞'}。`,
    artifact
  };
}
