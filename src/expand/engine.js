import { classifyIntent } from './classifier.js';
import { generateGeneric } from '../templates/generic.js';
import { generateWriting } from '../templates/writing.js';
import { generatePlanning } from '../templates/planning.js';

export function expandPrompt(userMessage, mode) {
  if (!userMessage || userMessage.trim() === '') {
    return null;
  }

  const intent = classifyIntent(userMessage);

  let artifact = null;
  let explanation = '';

  switch (intent) {
    case 'writing':
      artifact = generateWriting(userMessage, mode);
      explanation = '根據您的需求，我使用了「文案撰寫」模板為您擴寫。';
      break;
    case 'planning':
      artifact = generatePlanning(userMessage, mode);
      explanation = '根據您的需求，我使用了「企劃與規劃」模板為您擴寫。';
      break;
    case 'generic':
    default:
      artifact = generateGeneric(userMessage, mode);
      explanation = '根據您的需求，我使用了「通用」模板為您擴寫。';
      break;
  }

  return {
    explanation,
    artifact
  };
}
