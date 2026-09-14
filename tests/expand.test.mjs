import test from 'node:test';
import assert from 'node:assert';
import { expandPrompt } from '../src/expand/engine.js';
import { classifyIntent } from '../src/expand/classifier.js';

test('classifyIntent', async (t) => {
  await t.test('should identify writing intent', () => {
    assert.strictEqual(classifyIntent('幫我寫一篇貼文'), 'writing');
    assert.strictEqual(classifyIntent('撰寫一封信件'), 'writing');
  });

  await t.test('should identify planning intent', () => {
    assert.strictEqual(classifyIntent('幫我安排活動行程'), 'planning');
    assert.strictEqual(classifyIntent('規劃專案'), 'planning');
  });

  await t.test('should fallback to generic intent', () => {
    assert.strictEqual(classifyIntent('隨便說點什麼'), 'generic');
    assert.strictEqual(classifyIntent(''), 'generic');
    assert.strictEqual(classifyIntent(null), 'generic');
  });
});

test('expandPrompt - Single Mode', async (t) => {
  await t.test('should handle generic intent in single mode', () => {
    const result = expandPrompt('隨便說點什麼', 'single');
    assert.ok(result);
    assert.strictEqual(result.explanation, '根據您的需求，我使用了「通用」模板為您擴寫。');
    assert.strictEqual(result.artifact.title, '通用任務提示詞');
    assert.ok(result.artifact.body.includes('隨便說點什麼'));
    assert.ok(result.artifact.body.includes('請扮演一位專業的 AI 助理。'));
  });

  await t.test('should handle writing intent in single mode', () => {
    const result = expandPrompt('寫一篇貼文', 'single');
    assert.ok(result);
    assert.strictEqual(result.explanation, '根據您的需求，我使用了「文案撰寫」模板為您擴寫。');
    assert.strictEqual(result.artifact.title, '文案撰寫提示詞');
    assert.ok(result.artifact.body.includes('寫一篇貼文'));
  });

  await t.test('should handle planning intent in single mode', () => {
    const result = expandPrompt('安排活動行程', 'single');
    assert.ok(result);
    assert.strictEqual(result.explanation, '根據您的需求，我使用了「企劃與規劃」模板為您擴寫。');
    assert.strictEqual(result.artifact.title, '企劃與規劃提示詞');
    assert.ok(result.artifact.body.includes('安排活動行程'));
  });

  await t.test('should return null for empty input', () => {
    assert.strictEqual(expandPrompt('', 'single'), null);
    assert.strictEqual(expandPrompt('   ', 'single'), null);
  });
});

test('expandPrompt - Chain Mode', async (t) => {
  await t.test('should handle generic intent in chain mode', () => {
    const result = expandPrompt('隨便說點什麼', 'chain');
    assert.ok(result);
    assert.strictEqual(result.explanation, '根據您的需求，我使用了「通用」模板為您擴寫。');
    assert.ok(result.artifact.steps);
    assert.strictEqual(result.artifact.steps.length, 3);
    assert.strictEqual(result.artifact.steps[0].name, '釐清需求');
    assert.ok(result.artifact.steps[0].prompt.includes('隨便說點什麼'));
  });

  await t.test('should handle writing intent in chain mode', () => {
    const result = expandPrompt('寫一篇貼文', 'chain');
    assert.ok(result);
    assert.strictEqual(result.explanation, '根據您的需求，我使用了「文案撰寫」模板為您擴寫。');
    assert.ok(result.artifact.steps);
    assert.strictEqual(result.artifact.steps.length, 3);
    assert.strictEqual(result.artifact.steps[0].name, '釐清受眾與調性');
    assert.ok(result.artifact.steps[0].prompt.includes('寫一篇貼文'));
  });
});
