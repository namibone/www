import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['', 'pilot/', 'citizens/', 'staff/', 'n1-wallet/', 'developers/', 'help/', 'releases/'];

test('every guide and its internal links are reachable', async ({ page, baseURL }) => {
  const { origin, pathname } = new URL(baseURL);
  const links = new Set();

  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveCount(1);
    for (const href of await page.locator('main a[href], nav a[href]').evaluateAll((anchors) => anchors.map((anchor) => anchor.href))) {
      if (href.startsWith(origin + pathname)) links.add(href);
    }
  }

  for (const href of links) {
    const target = new URL(href);
    if (!target.hash) {
      expect((await page.request.get(href)).status(), href).toBe(200);
      continue;
    }
    await page.goto(href);
    expect(await page.evaluate(() => Boolean(document.getElementById(decodeURIComponent(location.hash.slice(1))))), href).toBe(true);
  }
});

for (const width of [320, 390, 768, 1440]) {
  test(`docs reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, route || 'home').toBe(false);
    }
  });
}

for (const colorScheme of ['light', 'dark']) {
  test(`home and guides pass automated accessibility checks in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    for (const route of ['', 'pilot/', 'citizens/', 'staff/', 'n1-wallet/', 'developers/']) {
      await page.goto(route);
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect(violations, route || 'home').toEqual([]);
    }
  });
}

test('the mobile menu opens a guide and supports keyboard dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('citizens/');
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  const staffLink = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Pilot staff' });
  await menu.click();
  await expect(staffLink).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(staffLink).toBeHidden();
  await menu.click();
  await staffLink.click();
  await expect(page).toHaveURL(/\/staff\/$/);
  await expect(page.getByRole('main').getByRole('heading', { name: 'Pilot staff', exact: true })).toBeVisible();
});

test('keyboard search finds and opens the wallet guide', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('site-search button[data-open-modal]')).toBeEnabled();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog');
  const searchbox = dialog.getByRole('textbox', { name: 'Search guides' });
  await expect(searchbox).toBeFocused();
  await searchbox.fill('example transactions');
  const result = dialog.getByRole('link', { name: 'N1 Wallet', exact: true })
    .and(dialog.locator('a[href$="/n1-wallet/"]'));
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/n1-wallet\/(?:#.*)?$/);
  await expect(page.getByRole('main').getByRole('heading', { name: 'N1 Wallet', exact: true })).toBeVisible();
});
