const { test, expect } = require('@playwright/test');
const { trackPage } = require('./helpers');

// This spec is only meaningful under 768px (assets/css/styles.css puts the
// hamburger + mobile drawer behind a `@media (max-width: 768px)` rule), so it
// skips itself on the desktop project instead of asserting nothing useful.

test.describe('Mobile navigation', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'mobile-chromium', 'mobile-only behavior');
  });

  test('hamburger toggle opens and closes the mobile menu', async ({ page }) => {
    const tracking = trackPage(page);
    await page.goto('/index.html', { waitUntil: 'load' });

    const toggle = page.getByRole('button', { name: /toggle mobile menu/i });
    const mobileNav = page.locator('#nav-mobile');

    // Closed by default: top-level links are hidden, drawer is not marked open.
    await expect(page.locator('.nav__links')).toBeHidden();
    await expect(mobileNav).not.toHaveClass(/open/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // Open.
    await toggle.click();
    await expect(mobileNav).toHaveClass(/open/);
    await expect(mobileNav).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // Close by clicking the toggle again.
    await toggle.click();
    await expect(mobileNav).not.toHaveClass(/open/);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    tracking.assertClean();
  });

  test('a mobile-nav link navigates to the right page and closes the drawer', async ({ page }) => {
    const tracking = trackPage(page);
    await page.goto('/index.html', { waitUntil: 'load' });

    const toggle = page.getByRole('button', { name: /toggle mobile menu/i });
    await toggle.click();
    await expect(page.locator('#nav-mobile')).toHaveClass(/open/);

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().endsWith('/contact.html') && res.request().isNavigationRequest()
      ),
      page.locator('.nav__mobile-link', { hasText: 'Contact' }).click(),
    ]);

    expect(response.status()).toBe(200);
    await expect(page).toHaveURL(/contact\.html$/);
    await expect(page.locator('h1').first()).toContainText(/Let's Talk About/i);

    tracking.assertClean();
  });
});
