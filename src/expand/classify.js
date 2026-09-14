import { singleRegistry, chainRegistry } from './registry.js';

/**
 * @typedef {Object} PromptArtifact
 * @property {string} title
 * @property {string} body
 * @property {Array<{name: string, prompt: string}>} [steps]
 */

/**
 * @typedef {Object} ExpandResult
 * @property {string} explanation
 * @property {PromptArtifact[]} artifacts
 */

export function classify(userMessage, mode = 'single') {
  // Simplistic intent classification: just use default for now
  const registry = mode === 'chain' ? chainRegistry : singleRegistry;
  const template = registry.default;

  const artifact = template.build(userMessage);

  return {
    explanation: `根據您的需求，為您生成了${mode === 'chain' ? '提示詞鏈' : '一則提示詞'}。`,
    artifacts: [artifact]
  };
}
