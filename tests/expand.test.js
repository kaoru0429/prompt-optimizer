import test from 'node:test';
import assert from 'node:assert';
import { expand } from '../src/expand/engine.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const singleTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/templates/single/default.json'), 'utf-8'));
const chainTemplate = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/templates/chain/default.json'), 'utf-8'));

test('expand engine - single mode', (t) => {
  const wish = '幫我寫一封請假信';
  const result = expand(wish, 'single', [singleTemplate]);

  assert.ok(result.explanation.includes('單一提示詞'));
  assert.ok(result.artifact.title);
  assert.ok(result.artifact.body);
  assert.ok(result.artifact.body.includes(wish));
  assert.strictEqual(result.artifact.steps, undefined);
});

test('expand engine - chain mode', (t) => {
  const wish = '幫我規劃一個行銷活動';
  const result = expand(wish, 'chain', [chainTemplate]);

  assert.ok(result.explanation.includes('提示詞鏈'));
  assert.ok(result.artifact.title);
  assert.ok(result.artifact.body);
  assert.ok(result.artifact.body.includes(wish));

  assert.ok(Array.isArray(result.artifact.steps));
  assert.ok(result.artifact.steps.length >= 2, 'Chain mode should have at least 2 steps');

  result.artifact.steps.forEach(step => {
    assert.ok(step.name);
    assert.ok(step.prompt);
    assert.ok(step.prompt.includes(wish));
  });
});

test('expand engine - throws if no templates', (t) => {
  assert.throws(() => expand('test', 'single', []), /No templates provided/);
});
