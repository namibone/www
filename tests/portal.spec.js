import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('all public pages meet automated WCAG AA checks and load without errors', async ({page})=>{
  const errors = [];
  page.on('pageerror', e=>errors.push(e.message));
  for (const path of ['/','/explore.html','/privacy.html','/accessibility.html','/offline.html','/sitemap.html','/404.html']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    const results = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(results.violations,`${path}: ${JSON.stringify(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})))}`).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('provider buttons cannot start a login or leak data', async ({page})=>{
  const external = [];
  page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:4173/'))external.push(request.url());});
  await page.goto('/');
  for (const provider of ['Google','Microsoft','GitHub']) await expect(page.getByRole('button',{name:`Continue with ${provider} Coming soon`})).toBeDisabled();
  await expect(page.locator('#auth-note')).toContainText('Sign-in is not available');
  expect(external).toEqual([]);
});

test('preview keyboard flow, focus return and accessible modal',async({page})=>{
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
  const card = page.locator('[data-service="learning"]');
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button',{name:'Close preview'})).toBeFocused();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();
  await card.click();
  await page.getByRole('button',{name:'Close preview'}).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('layouts fit small screens, tablets and desktop',async({page},testInfo)=>{
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
    await page.screenshot({path:testInfo.outputPath(`home-${width}.png`),fullPage:true});
  }
});

test('public pages work without JavaScript',async({browser})=>{
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-service="learning"]').click();
  await expect(page).toHaveURL(/explore.html#learning$/);
  await expect(page.getByRole('heading',{name:'Learn & grow'})).toBeVisible();
  await context.close();
});

test('reduced motion disables smooth scrolling',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('offline reload and navigation preserve only public content',async({page,context})=>{
  await page.goto('/');
  await expect(page.locator('#offline-status')).toHaveText('Public pilot pages saved for offline reading.');
  await page.evaluate(()=>navigator.serviceWorker.controller ? Promise.resolve() : new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true})));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#connection-banner')).toBeVisible();
  await expect(page.locator('h1')).toContainText('More');
  await page.getByRole('link',{name:'Privacy',exact:true}).click();
  await expect(page.locator('h1')).toHaveText('Your privacy.');
  const keys = await page.evaluate(async()=>{const names=await caches.keys();return (await Promise.all(names.filter(n=>n.startsWith('onenam-')).map(async n=>(await(await caches.open(n)).keys()).map(r=>r.url)))).flat();});
  expect(keys.length).toBeGreaterThan(10);
  expect(keys.every(k=>!new URL(k).search && !/^\/(auth|token|callback|api)(\/|$)/.test(new URL(k).pathname))).toBe(true);
  const privateResponse = await page.evaluate(async()=>{try {return (await fetch('/auth/callback?code=example')).status;}catch{return 'offline';}});
  expect(privateResponse).toBe('offline');
});
