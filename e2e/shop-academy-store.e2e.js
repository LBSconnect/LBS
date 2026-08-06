const { test, expect } = require('@playwright/test');
const { trackPage } = require('./helpers');

// These primary CTAs point at real off-site checkout/enroll endpoints
// (checkout.lbs4.com via Stripe Payment Links). We only assert presence and
// a well-formed href — we never click through, so no real checkout session
// is ever created by this suite.

test.describe('Shop page', () => {
  test('loads without console errors and its product category CTAs are present', async ({ page }) => {
    const tracking = trackPage(page);
    const response = await page.goto('/shop.html', { waitUntil: 'load' });
    expect(response.status()).toBe(200);
    await expect(page.locator('h1').first()).toContainText(/LBS Shop/i);

    // Primary "Get"/product CTAs — one per shop category card.
    const ctas = page.locator('.shop-card__cta');
    const count = await ctas.count();
    expect(count).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < count; i++) {
      const href = await ctas.nth(i).getAttribute('href');
      expect(href, `shop CTA #${i} should have a non-empty href`).toBeTruthy();
      expect(href.trim().length).toBeGreaterThan(0);
    }

    tracking.assertClean();
  });
});

test.describe('Academy page', () => {
  test('loads without console errors and Enroll buttons have a non-empty href', async ({ page }) => {
    const tracking = trackPage(page);
    const response = await page.goto('/academy.html', { waitUntil: 'load' });
    expect(response.status()).toBe(200);
    await expect(page.locator('h1').first()).toContainText(/Online Business Analysis Training/i);

    const enrollButtons = page.locator('.enroll-btn');
    const count = await enrollButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < count; i++) {
      const btn = enrollButtons.nth(i);
      await expect(btn).toContainText(/Enroll/i);
      // Inline script rewrites href from "#" to the Stripe link on load —
      // wait for that rewrite rather than racing it.
      await expect
        .poll(async () => btn.getAttribute('href'))
        .not.toBe('#');
      const href = await btn.getAttribute('href');
      expect(href).toContain('checkout.lbs4.com');
    }

    tracking.assertClean();
  });
});

test.describe('BA Template Store page', () => {
  test('loads without console errors and Buy/Get buttons have a non-empty href', async ({ page }) => {
    const tracking = trackPage(page);
    const response = await page.goto('/ba-template-store.html', { waitUntil: 'load' });
    expect(response.status()).toBe(200);
    await expect(page.locator('h1').first()).toContainText(/Professional BA Templates/i);

    // Per-template "Buy" CTAs.
    const templateCtas = page.locator('.template-card__cta');
    const templateCount = await templateCtas.count();
    expect(templateCount).toBeGreaterThanOrEqual(5);
    for (let i = 0; i < templateCount; i++) {
      const href = await templateCtas.nth(i).getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toContain('checkout.lbs4.com');
    }

    // "Get Full Bundle" CTA.
    const bundleCta = page.getByRole('link', { name: /Get Full Bundle/i }).first();
    await expect(bundleCta).toBeVisible();
    const bundleHref = await bundleCta.getAttribute('href');
    expect(bundleHref).toBeTruthy();
    expect(bundleHref).toContain('checkout.lbs4.com');

    tracking.assertClean();
  });
});
