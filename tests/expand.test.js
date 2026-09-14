import { describe, it, expect } from 'vitest';
import { identifyIntent, expandPrompt } from '../src/expand/index.js';

describe('identifyIntent', () => {
  it('should identify code intent correctly', () => {
    expect(identifyIntent('幫我寫一個貪吃蛇遊戲')).toBe('code');
    expect(identifyIntent('開發一個登入系統')).toBe('code');
    expect(identifyIntent('Write some react code')).toBe('code');
  });

  it('should identify write intent correctly', () => {
    expect(identifyIntent('寫文章關於AI的發展')).toBe('write');
    expect(identifyIntent('幫我準備一份報告')).toBe('write');
    expect(identifyIntent('撰寫產品文案')).toBe('write');
  });

  it('should return default for unknown intents', () => {
    expect(identifyIntent('今天天氣如何')).toBe('default');
    expect(identifyIntent('推薦幾首好聽的歌')).toBe('default');
    expect(identifyIntent('hello')).toBe('default');
  });
});

describe('expandPrompt', () => {
  it('should expand correctly in single mode for code', () => {
    const input = '幫我寫一個貪吃蛇遊戲';
    const result = expandPrompt(input, 'single');
    expect(result).toContain('請擔任資深軟體工程師');
    expect(result).toContain(input);
    expect(result).toContain('完整的程式碼實作');
  });

  it('should expand correctly in chain mode for write', () => {
    const input = '寫文章關於AI的發展';
    const result = expandPrompt(input, 'chain');
    expect(result).toContain('【步驟 1/3：主旨與關鍵字】');
    expect(result).toContain(input);
    expect(result).toContain('【步驟 3/3：完整撰寫】');
  });

  it('should expand correctly for default intent', () => {
    const input = '今天天氣如何';
    const result = expandPrompt(input, 'single');
    expect(result).toContain('請擔任專業的專家');
    expect(result).toContain(input);
  });
});
