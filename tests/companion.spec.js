import {test,expect} from '@playwright/test';

test.describe('companion landing',()=>{
 test.use({serviceWorkers:'block'});

 test('prompt gives honest service guidance without transmitting or saving the conversation',async({page})=>{
  const requests=[];
  page.on('request',request=>requests.push({url:request.url(),method:request.method(),body:request.postData()}));
  await page.goto('/');
  const question='Please help me renew my vehicle licence marker-7361';
  await page.locator('#companion-prompt').fill(question);
  await page.locator('#companion-send').click();
  await expect(page.locator('#companion-conversation')).toBeVisible();
  await expect(page.locator('#companion-messages .user')).toContainText(question);
  await expect(page.locator('#companion-messages .assistant')).toContainText('Service guide preview');
  await expect(page.locator('#companion-messages a[href="/service-vehicle.html"]')).toBeVisible();
  await expect(page.locator('#companion-status')).toContainText('No question was sent');
  expect(new URL(page.url()).pathname).toBe('/');
  expect(new URL(page.url()).search+new URL(page.url()).hash).toBe('');
  expect(requests.every(request=>request.method==='GET'&&!request.url.includes('marker-7361')&&!request.body)).toBe(true);
  expect(requests.every(request=>new URL(request.url).origin==='http://127.0.0.1:4173')).toBe(true);
  const stored=await page.evaluate(()=>JSON.stringify({session:{...sessionStorage},local:{...localStorage}}));
  expect(stored).not.toContain('marker-7361');
  await page.reload();
  await expect(page.locator('#companion-messages .companion-message')).toHaveCount(0);
 });

 test('suggested question waits for explicit send and blank input explains what is needed',async({page})=>{
  await page.goto('/');
  await page.locator('#companion-send').click();
  await expect(page.locator('#companion-status')).toContainText('Type a question');
  await expect(page.locator('#companion-messages .user')).toHaveCount(0);
  await page.locator('[data-prompt]').first().click();
  await expect(page.locator('#companion-prompt')).not.toHaveValue('');
  await expect(page.locator('#companion-prompt')).toBeFocused();
  await expect(page.locator('#companion-messages .user')).toHaveCount(0);
  await page.locator('#companion-prompt').evaluate(input=>{input.value='a'.repeat(1001);});
  await page.locator('#companion-send').click();
  await expect(page.locator('#companion-status')).toContainText('1,000 characters');
  await expect(page.locator('#companion-messages .user')).toHaveCount(0);
 });

 test('prompt treats markup as text, supports multiline entry and clears on new chat',async({page})=>{
  await page.goto('/');
  await page.locator('#companion-prompt').fill('<img src=x onerror="window.companionUnsafe=true"> business');
  await page.locator('#companion-prompt').press('Shift+Enter');
  await expect(page.locator('#companion-messages .user')).toHaveCount(0);
  await page.locator('#companion-prompt').press('Enter');
  await expect(page.locator('#companion-messages .user')).toContainText('<img src=x');
  await expect(page.locator('#companion-messages img')).toHaveCount(0);
  expect(await page.evaluate(()=>window.companionUnsafe)).toBeUndefined();
  await expect(page.locator('#companion-messages a[href="/service-business.html"]')).toBeVisible();
  await page.locator('#companion-new-chat').click();
  await expect(page.locator('#companion-messages .companion-message')).toHaveCount(0);
  await expect(page.locator('#companion-welcome')).toBeVisible();
  await expect(page.locator('#companion-conversation')).toBeHidden();
  await expect(page.locator('#companion-prompt')).toHaveValue('');
  await expect(page.locator('#companion-prompt')).toBeFocused();
 });

 test('configured same-origin API renders plain text and reports provider failure honestly',async({page})=>{
  let submitted;
  await page.route('**/api/companion',async route=>{
   submitted=route.request().postDataJSON();
   await route.fulfill({json:{reply:'A mocked AI response with <script>not executable</script> text.'}});
  });
  await page.goto('/');
  await page.locator('[data-companion]').evaluate(root=>{root.dataset.companionEndpoint='/api/companion';});
  await page.locator('#companion-prompt').fill('Help with education');
  await page.locator('#companion-send').click();
  await expect(page.locator('#companion-messages .assistant')).toContainText('A mocked AI response');
  await expect(page.locator('#companion-messages .assistant')).toContainText('AI companion');
  await expect(page.locator('#companion-messages script')).toHaveCount(0);
  expect(submitted).toEqual({message:'Help with education',history:[]});
  await page.unroute('**/api/companion');
  await page.route('**/api/companion',route=>route.fulfill({status:503,body:'Unavailable'}));
  await page.locator('#companion-prompt').fill('Learning support');
  await page.locator('#companion-send').click();
  await expect(page.locator('#companion-messages .assistant').last()).toContainText('Live AI is unavailable');
  await expect(page.locator('#companion-messages .assistant').last().locator('a[href="/service-education.html"]')).toBeVisible();
  await expect(page.locator('#companion-status')).toContainText('AI could not respond');
  await expect(page.locator('#companion-send')).toBeEnabled();
 });

 test('configuration cannot send a question to another origin',async({page})=>{
  const external=[];
  page.on('request',request=>{if(new URL(request.url()).origin!=='http://127.0.0.1:4173')external.push(request.url());});
  await page.goto('/');
  await page.locator('[data-companion]').evaluate(root=>{root.dataset.companionEndpoint='https://external.invalid/api/companion';});
  await page.locator('#companion-prompt').fill('Find a school');
  await page.locator('#companion-send').click();
  await expect(page.locator('#companion-status')).toContainText('AI could not respond');
  expect(external).toEqual([]);
 });

 test('new chat cancels an in-flight response and does not revive cleared messages',async({page})=>{
  let release;
  const waiting=new Promise(resolve=>{release=resolve;});
  await page.route('**/api/companion',async route=>{
   await waiting;
   try{await route.fulfill({json:{reply:'Late reply must not appear.'}});}catch{/* The fetch was intentionally aborted. */}
  });
  await page.goto('/');
  await page.locator('[data-companion]').evaluate(root=>{root.dataset.companionEndpoint='/api/companion';});
  await page.locator('#companion-prompt').fill('Help with business');
  const request=page.waitForRequest('**/api/companion');
  await page.locator('#companion-send').click();
  await request;
  await expect(page.locator('#companion-send')).toBeDisabled();
  await page.locator('#companion-new-chat').click();
  release();
  await expect(page.locator('#companion-send')).toBeEnabled();
  await expect(page.locator('#companion-messages .companion-message')).toHaveCount(0);
  await expect(page.locator('#companion-status')).toContainText('New conversation');
 });

 test('offline questions still offer local service routes',async({page,context})=>{
  await page.goto('/');
  await context.setOffline(true);
  await page.locator('#companion-prompt').fill('Business registration');
  await page.locator('#companion-send').click();
  await expect(page.locator('#companion-messages a[href="/service-business.html"]')).toBeVisible();
  await expect(page.locator('#companion-status')).toContainText('offline');
 });

 test('motion can be paused and reduced-motion preference is honoured',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  const motion=page.locator('[data-motion-toggle]').first();
  await motion.click();
  await expect(motion).toHaveAttribute('aria-pressed','true');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(motion).toBeDisabled();
  await expect(motion).toHaveAttribute('aria-pressed','true');
  const moving=await page.locator('#companion-art').evaluate(art=>[art,...art.querySelectorAll('*')].some(node=>{
   const style=getComputedStyle(node);
   return style.animationName!=='none'&&style.animationDuration!=='0s'&&style.animationPlayState!=='paused';
  }));
  expect(moving).toBe(false);
 });

 test('unsupported dictation offers typing and never requests a microphone',async({page})=>{
  await page.addInitScript(()=>{
   Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
   Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});
  });
  await page.goto('/');
  await expect(page.locator('#companion-voice')).toBeDisabled();
  await expect(page.locator('#companion-voice')).toHaveAttribute('aria-label','Voice input unavailable in this browser');
  await expect(page.locator('#companion-prompt')).toBeEnabled();
 });

 test('dictation starts only on click and requires a separate send',async({page})=>{
  await page.addInitScript(()=>{
   class FakeSpeechRecognition{
    constructor(){window.testRecognition=this;}
    start(){window.testSpeechStarts=(window.testSpeechStarts||0)+1;}
    abort(){window.testSpeechAborts=(window.testSpeechAborts||0)+1;}
   }
   Object.defineProperty(window,'SpeechRecognition',{value:FakeSpeechRecognition,configurable:true});
  });
  await page.goto('/');
  expect(await page.evaluate(()=>window.testSpeechStarts||0)).toBe(0);
  await page.locator('#companion-voice').click();
  expect(await page.evaluate(()=>window.testSpeechStarts)).toBe(1);
  await page.evaluate(()=>{
   const result=Object.assign([{transcript:'Find learning support'}],{isFinal:true});
   window.testRecognition.onresult({results:[result]});
   window.testRecognition.onend();
  });
  await expect(page.locator('#companion-prompt')).toHaveValue('Find learning support');
  await expect(page.locator('#companion-messages .user')).toHaveCount(0);
  await expect(page.locator('#companion-status')).toContainText('Review your question');
 });

 test('artwork, title, topic bubbles and composer follow the homepage reference',async({page},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:960,height:960});
  await page.goto('/');
  const scene=page.locator('.companion-scene');
  const title=page.getByRole('heading',{name:'NamibOne Companion',exact:true});
  const topics=page.locator('#companion-welcome');
  const services=topics.getByRole('link',{name:'Information and services'});
  const learning=topics.getByRole('link',{name:'Learning and career'});
  const composer=page.locator('#companion-form');
  const artwork=scene.getByRole('img');
  await expect(artwork).toBeVisible();
  expect(await artwork.evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(topics.getByRole('link')).toHaveCount(5);
  await expect(topics.getByRole('link',{name:'Payments and finances'})).toHaveAttribute('href','/payments.html');
  await expect(topics.getByRole('link',{name:'Community and civic life'})).toHaveAttribute('href','/department-community.html');
  await expect(topics.getByRole('link',{name:'Places and local support'})).toHaveAttribute('href','/department-local.html');
  expect((await title.boundingBox()).x).toBeGreaterThan(480);
  expect((await services.boundingBox()).x).toBeLessThan(480);
  expect((await learning.boundingBox()).x).toBeGreaterThan(480);
  const prompt=await composer.boundingBox();
  expect(prompt.y).toBeGreaterThan(720);
  expect(prompt.y+prompt.height).toBeLessThan(850);
  await scene.screenshot({path:info.outputPath('companion-reference-960.png')});

  const menu=page.getByRole('button',{name:'Open navigation'});
  await expect(page.getByRole('navigation',{name:'Header navigation'}).getByRole('link',{name:'N1 Wallet',exact:true})).toHaveAttribute('href','https://n1wallet.net/');
  await menu.click();
  await expect(page.getByRole('navigation',{name:'Explore NamibOne'}).getByRole('link',{name:'N1 Wallet',exact:true})).toHaveAttribute('href','https://n1wallet.net/');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();

  await page.setViewportSize({width:390,height:844});
  const mobileWallet=page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'N1 Wallet',exact:true});
  await expect(mobileWallet).toBeVisible();
  await expect(mobileWallet).toHaveAttribute('href','https://n1wallet.net/');
  await expect(composer).toBeVisible();
  const art=await artwork.boundingBox();
  expect((await services.boundingBox()).y).toBeGreaterThanOrEqual(art.y+art.height);
  await learning.click();
  await expect(page).toHaveURL(/department-education\.html$/);
 });

 test('payments and finances links to the N1 Wallet dashboard preview',async({page})=>{
  await page.goto('/');
  await page.getByRole('link',{name:'Payments and finances',exact:true}).click();
  await expect(page).toHaveURL('/payments.html');
  const wallet=page.getByRole('link',{name:'Open N1 Wallet preview',exact:true});
  await expect(wallet).toBeVisible();
  await expect(wallet).toHaveAttribute('href','https://n1wallet.net/portal.html');
 });

 test('first arrival keeps the prompt visible on mobile and desktop',async({page},info)=>{
  for(const viewport of [{width:320,height:780},{width:390,height:844},{width:1440,height:1000}]){
   await page.setViewportSize(viewport);
   await page.goto('/');
   await expect(page.locator('#companion-prompt')).toBeVisible();
   const sendBox=await page.locator('#companion-send').boundingBox();
   expect(sendBox.y+sendBox.height).toBeLessThan(viewport.height-64);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:info.outputPath(`companion-${viewport.width}.png`),fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.locator('#companion-prompt').fill('Help me find learning opportunities');
  await page.locator('#companion-send').click();
  await expect(page.locator('#companion-messages .assistant')).toBeVisible();
  await page.screenshot({path:info.outputPath('companion-conversation-mobile.png'),fullPage:true});
 });
});
