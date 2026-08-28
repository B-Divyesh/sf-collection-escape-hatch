import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('one click opens the isolated demo with a finished report', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page).toHaveTitle('Demo — Collection Escape Hatch');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  await expect(page.getByText(/METHOD_CHANGED/)).toBeVisible();
  await expect(page.locator('#demo-title')).toBeFocused();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://collection-escape-hatch.sociobot.in/demo/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /isolated sample data/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
  expect(errors).toEqual([]);
});

test('demo history restores route metadata and focus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.locator('#demo-title')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle('Collection Escape Hatch — compare Postman migrations');
  await expect(page.locator('#hero-title')).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Compare your Postman migration exports');
  await page.goForward();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page).toHaveTitle('Demo — Collection Escape Hatch');
  await expect(page.locator('#demo-title')).toBeFocused();
});

test('direct demo supports reset and start-for-real', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveURL(/\/demo\/?$/);
  await expect(page.locator('h1')).toHaveText('Compare a sample Postman migration');
  await expect(page.locator('h1')).toBeFocused();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('h1')).toBeFocused();
  await page.getByRole('button', { name: 'Reset demo' }).first().click();
  await expect(page.getByText(/METHOD_CHANGED/)).toBeVisible();
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('#demo-banner')).toBeHidden();
});

test('errors explain recovery and sample remains usable', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Compare exports' }).click();
  await expect(page.getByText('Comparison stopped.')).toBeVisible();
  await expect(page.getByText(/Choose both/)).toBeVisible();
  await page.getByRole('button', { name: 'Try it with sample data' }).last().click();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
});

test('invalid replacement files cannot leave stale demo data active', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('#source-file').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{') });
  await expect(page.getByText(/not valid JSON/)).toBeVisible();
  await page.getByRole('button', { name: 'Compare exports' }).click();
  await expect(page.getByText(/Choose both/)).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).first().click();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
});

test('every route has metadata, shared landmarks, and no serious accessibility issue', async ({ page }) => {
  const routes = [
    ['/', 'Collection Escape Hatch — compare Postman migrations', 'https://collection-escape-hatch.sociobot.in/'],
    ['/demo/', 'Demo — Collection Escape Hatch', 'https://collection-escape-hatch.sociobot.in/demo/'],
    ['/privacy/', 'Privacy — Collection Escape Hatch', 'https://collection-escape-hatch.sociobot.in/privacy/'],
    ['/terms/', 'Terms — Collection Escape Hatch', 'https://collection-escape-hatch.sociobot.in/terms/']
  ] as const;
  for (const [path, title, canonical] of routes) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header nav a')).toHaveCount(4);
    await expect(page.getByText(/Built by Param Factory/)).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://collection-escape-hatch.sociobot.in/og-blueprint.png');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    expect((await page.locator('meta[name="description"]').getAttribute('content'))?.length).toBeLessThanOrEqual(155);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
    if (path !== '/') await expect(page.locator('h1')).toBeFocused();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  }
});

test('internal navigation links resolve without dead ends', async ({ page, request }) => {
  const checked = new Set<string>();
  for (const path of ['/', '/demo/', '/privacy/', '/terms/']) {
    await page.goto(path);
    const hrefs = await page.locator('a[href]').evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
    const currentOrigin = new URL(page.url()).origin;
    for (const href of hrefs.filter(href => new URL(href).origin === currentOrigin)) {
      const url = new URL(href);
      url.hash = '';
      if (checked.has(url.href)) continue;
      checked.add(url.href);
      expect((await request.get(url.href)).status(), url.href).toBeLessThan(400);
    }
  }
});

test('unknown routes return the designed 404 response', async ({ page }) => {
  const response = await page.goto('/definitely-not-a-route');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle('Not found — Collection Escape Hatch');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Return to a known route');
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByRole('link', { name: 'Return home' })).toBeVisible();
});

test('hash navigation moves focus and back restores it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Build from source' }).click();
  await expect(page.locator('#install h2')).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Install one local binary');
  await page.goBack();
  await expect(page).toHaveURL('/');
  await page.goForward();
  await expect(page.locator('#install h2')).toBeFocused();
});

test('keyboard focus, reduced motion, and mobile first screen stay usable', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  const outline = await page.getByRole('link', { name: 'Skip to content' }).evaluate(node => getComputedStyle(node).outline);
  expect(outline).toContain('3px');
  const wordmark = await page.locator('header .wordmark').boundingBox();
  expect(wordmark?.width).toBeGreaterThanOrEqual(44);
  expect(wordmark?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
  const duration = await page.locator('.button').first().evaluate(node => getComputedStyle(node).transitionDuration);
  expect(duration).toMatch(/0\.00001s|1e-05s|0s/);
  if (testInfo.project.name === 'mobile') {
    await expect(page.locator('.hero-figure')).toBeHidden();
    await expect(page.locator('.terminal pre')).toHaveAttribute('tabindex', '0');
    for (const fact of ['Runs locally', 'Works offline after first visit', 'Free under MIT']) {
      const box = await page.getByText(fact, { exact: true }).boundingBox();
      expect(box && box.y + box.height).toBeLessThanOrEqual(844);
    }
  }
});

test('external links announce that they leave the site', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'desktop') await expect(page.locator('a.nav-source')).toHaveAccessibleName(/Source.*opens external site/);
  await expect(page.getByRole('link', { name: /GitHub.*opens external site/ })).toBeVisible();
});
