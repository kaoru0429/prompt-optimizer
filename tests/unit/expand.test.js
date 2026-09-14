import { describe, it, expect } from 'vitest';
import { classify } from '../../src/expand/classify.js';

describe('Expand Engine (classify)', () => {
  it('should generate a valid single mode artifact', () => {
    const result = classify('幫我寫一封請假信', 'single');

    expect(result.explanation).toBeDefined();
    expect(result.artifacts.length).toBe(1);

    const artifact = result.artifacts[0];
    expect(artifact.title).toBeDefined();
    expect(artifact.body).toContain('幫我寫一封請假信');
    expect(artifact.steps).toBeUndefined();
  });

  it('should generate a valid chain mode artifact', () => {
    const result = classify('幫我寫一封請假信', 'chain');

    expect(result.explanation).toBeDefined();
    expect(result.artifacts.length).toBe(1);

    const artifact = result.artifacts[0];
    expect(artifact.title).toBeDefined();
    expect(artifact.body).toContain('幫我寫一封請假信');
    expect(artifact.steps).toBeDefined();
    expect(artifact.steps.length).toBeGreaterThanOrEqual(2);

    artifact.steps.forEach(step => {
      expect(step.name).toBeDefined();
      expect(step.prompt).toBeDefined();
    });
  });
});
