import { test, expect } from '@playwright/test';

test.describe('Prompt Optimizer Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should work in single mode', async ({ page }) => {
    // Check initial state
    await expect(page.locator('text=提示詞優化器')).toBeVisible();
    await expect(page.locator('text=單一提示詞')).toBeVisible();

    // Type and send a wish
    await page.getByTestId('wish-input').fill('寫個簡單的爬蟲');
    await page.getByTestId('send-button').click();

    // Verify response
    await expect(page.locator('text=寫個簡單的爬蟲').first()).toBeVisible();
    await expect(page.getByTestId('prompt-body')).toBeVisible();

    // Verify copy button exists
    const copyButton = page.getByTestId('copy-button');
    await expect(copyButton).toBeVisible();
  });

  test('should work in chain mode', async ({ page }) => {
    // Toggle to chain mode
    await page.getByTestId('mode-chain').click();

    // Type and send a wish
    await page.getByTestId('wish-input').fill('幫我規劃台北三日遊');
    await page.getByTestId('send-button').click();

    // Verify chain response structure
    await expect(page.locator('text=根據您的需求，為您生成了提示詞鏈。')).toBeVisible();

    // Verify steps exist (should be at least 2)
    const stepCards = page.getByTestId('step-card');
    await expect(stepCards).toHaveCount(2);

    // Verify copy buttons on steps
    const copyButtons = page.getByTestId('copy-button');
    await expect(copyButtons).toHaveCount(2);
  });
});
