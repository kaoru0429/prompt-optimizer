import { test, expect } from '@playwright/test';

test.describe('Prompt Optimizer Chat Flow', () => {
  test.beforeEach(async ({ context, page }) => {
    // Grant clipboard permissions for tests
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
  });

  test('should work in single mode and copy to clipboard', async ({ page }) => {
    // Check initial state
    await expect(page.locator('text=提示詞優化器')).toBeVisible();
    await expect(page.locator('text=單一提示詞')).toBeVisible();

    // Type and send a wish
    await page.getByTestId('wish-input').fill('寫個簡單的爬蟲');
    await page.getByTestId('send-button').click();

    // Verify response
    await expect(page.locator('text=寫個簡單的爬蟲').first()).toBeVisible();
    await expect(page.getByTestId('prompt-body')).toBeVisible();

    // Verify copy functionality
    const copyButton = page.getByTestId('copy-button');
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Check UI feedback
    await expect(page.locator('text=已複製！')).toBeVisible();

    // Check clipboard content
    const promptText = await page.getByTestId('prompt-body').innerText();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(promptText);
  });

  test('should work in chain mode and handle copying of all steps', async ({ page }) => {
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

    // Verify copy buttons on steps and test them
    const copyButtons = page.getByTestId('copy-button');
    await expect(copyButtons).toHaveCount(2);

    for (let i = 0; i < 2; i++) {
      await copyButtons.nth(i).click();
      await expect(copyButtons.nth(i)).toHaveText('已複製！');

      const stepPromptText = await page.getByTestId('step-card').nth(i).locator('pre').innerText();
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardText).toBe(stepPromptText);
    }
  });

  test('should switch modes within one conversation seamlessly', async ({ page }) => {
    // 1. Single mode
    await page.getByTestId('wish-input').fill('測試單一模式');
    await page.getByTestId('send-button').click();
    await expect(page.getByTestId('prompt-body')).toBeVisible();

    // 2. Switch to chain mode
    await page.getByTestId('mode-chain').click();
    await page.getByTestId('wish-input').fill('測試提示詞鏈模式');
    await page.getByTestId('send-button').click();

    // Both responses should be in the chat
    await expect(page.locator('text=測試單一模式').first()).toBeVisible();
    await expect(page.locator('text=測試提示詞鏈模式').first()).toBeVisible();

    const stepCards = page.getByTestId('step-card');
    await expect(stepCards).toHaveCount(2);

    // 3. Switch back to single mode
    await page.getByTestId('mode-single').click();
    await page.getByTestId('wish-input').fill('再度測試單一模式');
    await page.getByTestId('send-button').click();

    await expect(page.locator('text=再度測試單一模式').first()).toBeVisible();
    // Prompt body should be found twice (first request and third request)
    const promptBodies = page.getByTestId('prompt-body');
    await expect(promptBodies).toHaveCount(2);
  });

  test('should handle clipboard copy failure', async ({ context, page }) => {
    // Revoke clipboard permissions to simulate failure
    await context.clearPermissions();

    await page.getByTestId('wish-input').fill('測試複製失敗');
    await page.getByTestId('send-button').click();

    const copyButton = page.getByTestId('copy-button');
    await copyButton.click();

    await expect(page.locator('text=複製失敗，請手動複製')).toBeVisible();
  });
});
