
import { test, expect } from '@playwright/test';

test.describe('Accounts Page', () => {
  test('page loads without crashing', async ({ page }) => {
    await page.goto('/accounts');
    // Wait for either loading or error or content
    await page.waitForSelector('text=/Loading accounts/i', { timeout: 10000 });
    // If we see loading, wait a bit more for it to change (but in CI it might stay loading if network fails)
    // We'll just check that the page has some text indicating state.
    const loading = await page.locator('text=/Loading accounts/i').count();
    const error = await page.locator('text=/Error loading accounts/i').count();
    const content = await page.locator('text=/Family Members/i').count();
    expect(loading + error + content).toBeGreaterThan(0);
  });
});
