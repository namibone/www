import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { sep } from 'node:path';
import { load } from 'cheerio';
import postcss from 'postcss';
import colorNames from 'color-name';
import { runInNewContext } from 'node:vm';
import { acknowledgementPath } from '../assets/stakeholder-agreement-shared.js';
const read = p => readFile(p,'utf8');
const css = await read('dist/assets/global.css');
const agreementCss = await read('dist/assets/stakeholder-agreement.css');
const tokens = await read('dist/assets/tokens.css');
const declared = new Set();
postcss.parse(tokens).walkDecls(d => declared.add(d.prop));
for (const stylesheet of [css, agreementCss]) postcss.parse(stylesheet).walkDecls(d => {
  const literal = d.value.replace(/var\(--[\w-]+\)/g,'');
  const keyword = (literal.match(/\b[a-z]+\b/gi) || []).some(word=>Object.hasOwn(colorNames,word.toLowerCase()));
  assert(!keyword && !/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|device-cmyk)\(/i.test(literal), `Use a shared color token: ${d.toString()}`);
  for (const [,name] of d.value.matchAll(/var\((--[\w-]+)/g)) assert(declared.has(name), `Undefined token ${name}`);
  if (d.prop === 'font-family') assert(d.value.startsWith('var(--font-'), 'Use shared font tokens');
});
assert(css.includes(':focus-visible'), 'Visible keyboard focus is required');
assert(css.includes('prefers-reduced-motion: reduce'), 'Reduced motion support is required');
assert(css.includes('max-width: 700px'), 'Mobile layout is required');
assert.equal((await read('CNAME')).trim(),'namibone.com','Preserve production domain');
assert.equal((await read('dist/CNAME')).trim(),'namibone.com');
const agreementFile = 'forms/index.html';
const files = (await readdir('dist', { recursive: true })).filter(f=>f.endsWith('.html')).map(f=>f.split(sep).join('/'));
assert(files.includes(agreementFile), 'The stakeholder agreement must be published at /forms/index.html');
let total = 0;
let agreementTotal = 0;
for (const file of [...files,...(await readdir('dist/assets')).map(f=>`assets/${f}`)]) {
  const { size } = await stat(`dist/${file}`);
  total += size;
  if (file === agreementFile || file.startsWith('assets/stakeholder-agreement')) agreementTotal += size;
}
assert(total - agreementTotal < 650_000, `Prototype page/assets budget exceeded: ${total - agreementTotal} bytes`);
assert(agreementTotal < 32_000, `Stakeholder agreement page/assets budget exceeded: ${agreementTotal} bytes`);
for (const file of files) {
  const $ = load(await read(`dist/${file}`));
  const isAgreement = file === agreementFile;
  assert((await stat(`dist/${file}`)).size < 40_000,`${file}: individual page exceeds 40 KB`);
  assert.equal($('html').attr('lang'),'en',`${file}: document language`);
  assert.equal($('h1').length,1,`${file}: exactly one h1`);
  assert.equal($('main#main').length,1,`${file}: main landmark`);
  assert.equal($('link[rel="stylesheet"]').attr('href'),'/assets/global.css',`${file}: shared styles required`);
  assert.equal($('link[rel="icon"][type="image/svg+xml"]').length,1,`${file}: tab icon`);
  assert.equal($('style,[style],[onclick],script:not([src])').length,0,`${file}: no inline styling or scripts`);
  const policy = $('meta[http-equiv="Content-Security-Policy"]').attr('content');
  assert(policy.includes("form-action 'none'"));
  const connect = policy.split(';').find(directive => directive.startsWith('connect-src '));
  assert($('title').text().includes('NamibOne'));
  assert($('meta[name="description"]').attr('content'));
  assert($('a.skip-link[href="#main"]').length);
  assert($('footer').text().includes('Government affiliation and endorsement are not verified.'));
  assert($('.prototype-bar').text().includes('No live government transactions.'));
  assert($('nav[aria-label="Breadcrumb"]').length);
  assert.equal($('input[type="file"],input[type="password"]').length,0,'Never collect documents or credentials');
  if (isAgreement) {
    const form = $('#stakeholder-form[method="post"]');
    assert.equal(form.length, 1, 'The agreement requires a dedicated acknowledgement form');
    assert.equal(form.attr('action'), undefined, 'Acknowledgements must use the scoped form handler');
    const endpoint = form.attr('data-endpoint');
    if (endpoint) {
      const url = new URL(endpoint);
      assert.equal(url.protocol, 'https:');
      assert.equal(endpoint, `${url.origin}${acknowledgementPath}`);
      assert.equal(connect, `connect-src 'self' ${url.origin}`, 'Limit the destination to the configured handler');
    } else assert.equal(connect, "connect-src 'self'");
    assert.equal(form.find('input[type="checkbox"][required]').length, 2, 'Both declarations must be required');
    assert.equal(form.find('input[name="signature"][required]').length, 1, 'A typed signature is required');
  } else {
    assert.equal(connect, "connect-src 'self'", 'The submission handler is scoped to the stakeholder agreement');
    assert.equal($('input[type="email"],textarea:not(#companion-prompt)').length,0,'Prototype pages must not collect private records');
  }
  if(file==='index.html'){
    assert.equal($('textarea#companion-prompt[maxlength="1000"]').length,1,'Home must offer the bounded conversation prompt');
    assert.equal($('[data-companion-endpoint]').length,0,'Live AI must not be claimed before its backend is configured');
    assert.equal($('script[src="/assets/companion.js"]').length,1,'Home companion module is required');
    assert.equal($('[data-motion-toggle]').length,1,'Avatar animation requires a pause control');
  }else if (!isAgreement) assert.equal($('textarea').length,0,'Free-text prompts are limited to the companion and agreement');
  const ids = $('[id]').map((_,e)=>$(e).attr('id')).get();
  assert.equal(new Set(ids).size,ids.length,`${file}: duplicate IDs`);
  $('img').each((_,e)=>assert($(e).attr('alt') !== undefined,`${file}: image alt required`));
  const references = $('[src],link[href],a[href]').toArray();
  for (const el of references) {
    const ref = $(el).attr('src') || $(el).attr('href');
    assert(ref && ref !== '#',`${file}: no placeholder links`);
    if (ref.startsWith('mailto:')) {
      assert(isAgreement && el.tagName === 'a' && ref === 'mailto:raydo@skunkworks.africa', `${file}: unexpected email destination`);
      continue;
    }
    if (/^https?:/.test(ref)) {
      assert(el.tagName === 'a' || (el.tagName === 'link' && $(el).attr('rel') === 'canonical'),`${file}: no external runtime assets`);
      continue;
    }
    const url = new URL(ref,`https://namibone.com/${file === 'index.html'?'':file}`);
    const target = url.pathname === '/' ? '/index.html' : url.pathname;
    await stat(`dist${target}`);
    if (url.hash) { const other = load(await read(`dist${target}`)); assert(other(`[id="${url.hash.slice(1)}"]`).length,`${file}: broken anchor ${ref}`); }
  }
}
const signin = load(await read('dist/signin.html'));
assert.equal(signin('button.provider[disabled]').length,3,'All unconfigured providers must stay disabled');
const manifest=JSON.parse(await read('dist/page-manifest.json'));
const offline=JSON.parse(await read('dist/offline-manifest.json'));
for(const page of manifest){
  assert.equal(offline.includes(page.path),page.offline,`Offline scope: ${page.path}`);
}
assert(offline.includes('/assets/data.js'),'Browser module dependency must be cached');
const sitemap = load(await read('dist/sitemap.xml'),{xml:true});
for (const f of files.filter(f=>f!=='404.html')) assert(sitemap('loc').toArray().some(e=>sitemap(e).text()===`https://namibone.com/${f==='index.html'?'':f}`),`Sitemap missing ${f}`);
const sw = await read('dist/sw.js');
const handlers = {};
const lifecycle = [];
let currentCache;
let precacheError;
runInNewContext(sw, {
  self: {
    location:{origin:'https://namibone.com'},
    addEventListener:(type,handler)=>{handlers[type]=handler;},
    skipWaiting:async()=>{lifecycle.push('skip waiting');},
    clients:{claim:async()=>{lifecycle.push('claim clients');}},
  },
  URL, Request,
  caches: {
    open:async name=>{
      currentCache=name;
      return {
        addAll:async requests=>{
          if(precacheError)throw precacheError;
          assert.deepEqual(Array.from(requests,request=>new URL(request.url).pathname),offline);
          assert(requests.every(request=>request.cache==='reload'));
          lifecycle.push('precache');
        },
        match:async()=>new Response('older public copy'),
      };
    },
    keys:async()=>['onenam-previous-build',currentCache,'unrelated-cache'],
    delete:async name=>{lifecycle.push(`delete ${name}`);},
  },
  fetch:async (_request,options)=>{
    assert.equal(options.cache,'no-cache','Online public responses should revalidate');
    return new Response('network');
  },
});
let lifecyclePromise;
const lifecycleEvent={waitUntil:promise=>{lifecyclePromise=promise;}};
precacheError=new Error('simulated precache failure');
handlers.install(lifecycleEvent);
await assert.rejects(lifecyclePromise,precacheError);
assert.deepEqual(lifecycle,[],'An incomplete precache must leave the old worker active');
precacheError=null;
handlers.install(lifecycleEvent);
await lifecyclePromise;
handlers.activate(lifecycleEvent);
await lifecyclePromise;
assert.deepEqual(lifecycle,['precache','skip waiting','delete onenam-previous-build','claim clients']);
const cacheCases = [
  ['/', 'GET', true], ['/privacy.html','GET',true], ['/assets/global.css','GET',true],
  ['/?code=sensitive','GET',false], ['/privacy.html?session=sensitive','GET',false],
  ['/auth/callback','GET',false], ['/api/session','GET',false], ['/unknown.html','GET',false],
  ['/forms/index.html','GET',false], ['/forms/','GET',false],
  ['/citizen-dashboard.html','GET',false], ['/staff-cases.html','GET',false], ['/payments.html','GET',false], ['/receipt.html','GET',false],
  ['/', 'POST', false], ['https://other.example/','GET',false],
];
for (const [path,method,expected] of cacheCases) {
  let intercepted = false;
  let response;
  handlers.fetch({request:{url:new URL(path,'https://namibone.com').href,method},respondWith:value=>{intercepted=true;response=value;}});
  assert.equal(intercepted,expected,`Offline cache boundary: ${method} ${path}`);
  if (response) assert.equal(await (await response).text(),'network',`Online response for ${path}`);
}
// Force a genuine worker-network failure: browser offline emulation does not
// consistently apply to worker-originated requests across browser engines.
const failureHandlers = {};
const offlineCopies=new Map([
  ['/','saved homepage'],['/assets/global.css','saved stylesheet'],['/offline.html','offline guide'],
]);
runInNewContext(sw, {
  self: { location:{origin:'https://namibone.com'}, addEventListener:(type,handler)=>{failureHandlers[type]=handler;} },
  URL,
  caches: { open:async()=>({match:async path=>offlineCopies.has(path)?new Response(offlineCopies.get(path)):undefined}) },
  fetch:async()=>{throw new Error('simulated network failure');},
});
for (const [path,mode,expected] of [
  ['/','navigate','saved homepage'],
  ['/privacy.html','navigate','offline guide'],
  ['/assets/global.css','cors','saved stylesheet'],
  ['/assets/app.js','cors',null],
]) {
  let response;
  failureHandlers.fetch({request:{url:`https://namibone.com${path}`,method:'GET',mode},respondWith:value=>{response=value;}});
  if (expected) assert.equal(await (await response).text(),expected);
  else await assert.rejects(response,/simulated network failure/);
}
console.log(`Design gate passed: ${files.length} pages, shared tokens, links, metadata, honest auth, offline boundary; ${Math.round(total/1024)} KiB.`);
