import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
const pages=JSON.parse(await readFile('dist/page-manifest.json','utf8'));

// Split every route into independent checks: failures identify their exact page.
for(const entry of pages){
 test(`accessible route: ${entry.path}`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(entry.path);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-loading]')).toHaveCount(0);
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  expect(errors).toEqual([]);
 });
}
test('search, category filtering and no-results recovery',async({page})=>{
 await page.goto('/');await page.getByRole('searchbox').fill('vehicle');await page.getByRole('button',{name:'Search',exact:true}).click();
 await expect(page).toHaveURL(/services.html#q=vehicle/);
 await expect(page.locator('[data-service-card]:visible')).toHaveCount(1);
 await page.getByRole('searchbox').fill('not-a-service');await expect(page.getByRole('heading',{name:'No matching services'})).toBeVisible();
 await page.getByRole('button',{name:'Clear search and filters'}).click();await expect(page.locator('[data-service-card]:visible')).toHaveCount(8);
 await page.getByRole('button',{name:'Identity & family',exact:true}).click();await expect(page.locator('[data-service-card]:visible')).toHaveCount(2);
});
test('sample request travels from citizen to staff and back',async({page})=>{
 await page.goto('/service-business.html');await page.getByRole('link',{name:'Start sample request'}).click();
 await expect(page.locator('#request-service')).toHaveValue('business');
 await page.getByRole('button',{name:'Continue'}).click();await page.locator('#request-type').selectOption('Information enquiry');
 await page.getByRole('button',{name:'Continue'}).click();await page.getByRole('button',{name:'Create sample request'}).click();
 await expect(page.locator('#wizard-status')).toContainText('Confirm');await page.locator('#request-confirm').check();await page.getByRole('button',{name:'Create sample request'}).click();
 await expect(page.getByRole('heading',{name:'Sample request created'})).toBeVisible();await page.getByRole('link',{name:'Track sample request'}).click();
 await expect(page.locator('#application-detail')).toContainText('DEMO-1004');await expect(page.locator('#application-detail')).toContainText('Received');
 await page.goto('/staff-case.html?id=DEMO-1004');await page.locator('#case-status').selectOption('Completed');await page.getByRole('button',{name:'Save sample status'}).focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('button',{name:'Save sample status'})).toBeFocused();
 await expect(page.locator('#case-update-status')).toContainText('updated');await page.goto('/citizen-application.html?id=DEMO-1004');await expect(page.locator('#application-detail .badge')).toHaveText('Completed');
 await page.goto('/citizen-applications.html');await page.locator('#status-filter').selectOption('Completed');await expect(page.locator('tbody tr')).toHaveCount(2);
});
test('payment simulation, duplicate prevention, receipt and reset',async({page})=>{
 const external=[];page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173/'))external.push(r.url());});
 await page.goto('/payment-review.html?id=INV-101');await page.getByRole('button',{name:'Simulate payment',exact:true}).click();await expect(page.locator('#payment-status')).toContainText('Confirm');
 await page.locator('#payment-confirm').check();await page.getByRole('button',{name:'Simulate payment',exact:true}).click();await expect(page.locator('#receipt-detail')).toContainText('NOT PROOF OF PAYMENT');await expect(page.locator('#receipt-detail')).toContainText('N$0.00');
 await page.goto('/payment-review.html?id=INV-101');await expect(page.getByRole('heading',{name:'This sample payment is already simulated'})).toBeVisible();
 await page.goto('/payment-history.html');await expect(page.locator('#payment-history .list-row')).toHaveCount(1);
 await page.goto('/citizen-profile.html');await page.locator('#reset-confirm').check();await page.getByRole('button',{name:'Reset sample workspace'}).click();await page.goto('/payment-history.html');await expect(page.getByRole('heading',{name:'No simulations yet'})).toBeVisible();expect(external).toEqual([]);
});
test('message read state, preset reply and local staff notice',async({page})=>{
 await page.goto('/citizen-message.html?id=MSG-01');await page.getByRole('button',{name:'Save local sample reply'}).click();await expect(page.locator('#reply-result')).toContainText('Nothing was sent');
 await page.goto('/citizen-messages.html');await page.getByRole('button',{name:'Unread',exact:true}).click();await expect(page.locator('[data-message-list] .list-row')).toHaveCount(2);
 await page.goto('/staff-communications.html');await page.locator('#notice-template').selectOption('maintenance');await page.getByRole('button',{name:'Preview notice',exact:true}).click();await expect(page.locator('#notice-preview')).toContainText('No actual outage');await page.getByRole('button',{name:'Save local sample notice'}).click();await expect(page.locator('#notice-status')).toContainText('Nothing was published or sent');await expect(page.locator('#local-notices')).toContainText('Sample maintenance notice');
});
test('mobile navigation, keyboard, reduced motion and narrow layouts',async({page},info)=>{
 await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to content'})).toBeFocused();
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const path of ['/','/services.html','/citizen-dashboard.html','/staff-dashboard.html','/payments.html','/citizen-new-application.html']){
   await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${path} at ${width}`).toBe(true);
   if(width===390||width===1440)await page.screenshot({path:info.outputPath(`${path.replace(/\W/g,'')||'home'}-${width}.png`),fullPage:true});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('button',{name:'Open navigation'}).click();await expect(page.locator('#sidebar')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('#sidebar')).not.toBeVisible();await expect(page.getByRole('button',{name:'Open navigation'})).toBeFocused();
});
test('mobile public navigation and guidance work without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');await expect(page.locator('#sidebar')).toBeVisible();await page.getByRole('navigation',{name:'Explore OneNam',exact:true}).getByRole('link',{name:'Find a service'}).click();await page.locator('[data-service-card]').first().click();await expect(page.locator('h1')).toHaveText('Identity document');await context.close();
});
test('offline cache includes public dependencies and excludes all workspaces',async({page,context})=>{
 await page.goto('/');await expect(page.locator('#offline-status')).toContainText('saved for offline');await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
 const expected=JSON.parse(await readFile('dist/offline-manifest.json','utf8'));
 const keys=await page.evaluate(async()=>{const names=await caches.keys();return(await Promise.all(names.filter(n=>n.startsWith('onenam-')).map(async n=>(await(await caches.open(n)).keys()).map(r=>r.url)))).flat();});
 expect(keys.map(k=>new URL(k).pathname).sort()).toEqual(expected.sort());expect(keys.every(k=>!new URL(k).search&&!/^\/(citizen-|staff-|payment|receipt)/.test(new URL(k).pathname))).toBe(true);
 await context.setOffline(true);await page.reload();await expect(page.locator('#connection-banner')).toBeVisible();await page.getByRole('searchbox').fill('vehicle');await page.getByRole('button',{name:'Search',exact:true}).click();await expect(page).toHaveURL(/services.html#q=vehicle/);await expect(page.locator('[data-service-card]:visible')).toHaveCount(1);await page.locator('[data-service-card]:visible').click();await expect(page.locator('h1')).toHaveText('Vehicle licence renewal');
});
test('history restoration reloads newer tab state before edits',async({page})=>{
 await page.goto('/staff-case.html?id=DEMO-1001');
 await page.evaluate(()=>{const state={applications:[{id:'DEMO-1001',service:'identity',status:'Completed',date:'2026-11-16',type:'Renewal',channel:'Portal inbox'}],read:[],replies:{},payments:[],notices:[]};sessionStorage.setItem('onenam-demo-v2',JSON.stringify(state));dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
 await expect(page.locator('#case-status')).toHaveValue('Completed');await expect(page.locator('#main')).not.toHaveAttribute('inert','');
});
test('unconfigured sign-in, invalid references and corrupted sample state are honest',async({page})=>{
 await page.goto('/signin.html');await expect(page.locator('button.provider:disabled')).toHaveCount(3);await expect(page.locator('#auth-note')).toContainText('unconfigured');
 await page.goto('/receipt.html?id=unknown');await expect(page.getByRole('heading',{name:'No simulated receipt found'})).toBeVisible();
 await page.goto('/citizen-application.html?id=unknown');await expect(page.getByRole('heading',{name:'Sample request not found'})).toBeVisible();
 await page.evaluate(()=>sessionStorage.setItem('onenam-demo-v2','{broken'));await page.goto('/citizen-dashboard.html');await expect(page.locator('#metric-open')).toHaveText('2');
});
test('blocked storage does not promise a persistent request or payment receipt',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});
 await page.goto('/payment-review.html?id=INV-101');await page.locator('#payment-confirm').check();await page.getByRole('button',{name:'Simulate payment',exact:true}).click();await expect(page).toHaveURL(/payment-review/);await expect(page.locator('#payment-status')).toContainText('no receipt or history can be saved');
 await page.goto('/citizen-new-application.html');await page.getByRole('button',{name:'Continue'}).click();await page.getByRole('button',{name:'Continue'}).click();await page.locator('#request-confirm').check();await page.getByRole('button',{name:'Create sample request'}).click();await expect(page.locator('#request-result-link')).not.toBeVisible();await expect(page.locator('#wizard-status')).toContainText('cannot be tracked');
});
