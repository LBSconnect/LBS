const { test, expect } = require('@playwright/test');

test.describe('Nonexistent page', () => {
  test('returns a non-500 status and the server keeps responding afterward', async ({ page, request }) => {
    const response = await page.goto('/this-page-definitely-does-not-exist-xyz.html', {
      waitUntil: 'load',
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);

    // Server didn't crash: a subsequent request for a real page still works.
    const followUp = await request.get('/index.html');
    expect(followUp.status()).toBe(200);

    // And the health check is still up.
    const health = await request.get('/health');
    expect(health.status()).toBe(200);
    const body = await health.json();
    expect(body).toEqual({ ok: true });
  });
});
