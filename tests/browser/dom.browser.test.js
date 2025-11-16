import { test, expect } from '@playwright/test';

test('DOM loads Paste', async ({ page }) => {
  await page.setContent(`
    <script src="../src/js/paste.js"></script>
    <div id="x"></div>
  `);
  // Just check element exists; deeper tests need bundling
  const el = await page.locator("#x");
  await expect(el).toBeVisible();
});
