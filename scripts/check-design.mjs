import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import postcss from 'postcss';
import colorNames from 'color-name';
import { runInNewContext } from 'node:vm';
const read = p => readFile(p,'utf8');
const css = await read('dist/assets/global.css');
const tokens = await read('dist/assets/tokens.css');
const declared = new Set();
postcss.parse(tokens).walkDecls(d => declared.add(d.prop));
postcss.parse(css).walkDecls(d => {
  const literal = d.value.replace(/var\(--[\w-]+\)/g,'');
  const keyword = (literal.match(/\b[a-z]+\b/gi) || []).some(word=>Object.hasOwn(colorNames,word.toLowerCase()));
  assert(!keyword && !/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark|device-cmyk)\(/i.test(literal), `Use a shared color token: ${d.toString()}`);
  for (const [,name] of d.value.matchAll(/var\((--[\w-]+)/g)) assert(declared.has(name), `Undefined token ${name}`);
  if (d.prop === 'font-family') assert(d.value.startsWith('var(--font-'), 'Use shared font tokens');
});
assert(css.includes(':focus-visible'), 'Visible keyboard focus is required');
assert(css.includes('prefers-reduced-motion: reduce'), 'Reduced motion support is required');
assert(css.includes('max-width: 700px'), 'Mobile layout is required');
assert.equal((await read('CNAME')).trim(),'onenam.africa','Preserve production domain');
assert.equal((await read('dist/CNAME')).trim(),'onenam.africa');
const files = (await readdir('dist')).filter(f=>f.endsWith('.html'));
let total = 0;
for (const file of [...files,...(await readdir('dist/assets')).map(f=>`assets/${f}`)]) total += (await stat(`dist/${file}`)).size;
assert(total < 650_000, `Complete prototype page/assets budget exceeded: ${total} bytes`);
for (const file of files) {
  const $ = load(await read(`dist/${file}`));
  assert((await stat(`dist/${file}`)).size < 40_000,`${file}: individual page exceeds 40 KB`);
  assert.equal($('html').attr('lang'),'en',`${file}: document language`);
  assert.equal($('h1').length,1,`${file}: exactly one h1`);
  assert.equal($('main#main').length,1,`${file}: main landmark`);
  assert.equal($('link[rel="stylesheet"]').attr('href'),'/assets/global.css',`${file}: shared styles required`);
  assert.equal($('link[rel="icon"][type="image/svg+xml"]').length,1,`${file}: tab icon`);
  assert.equal($('style,[style],[onclick],script:not([src])').length,0,`${file}: no inline styling or scripts`);
  assert($('meta[http-equiv="Content-Security-Policy"]').attr('content').includes("form-action 'none'"));
  assert($('title').text().includes('OneNam'));
  assert($('meta[name="description"]').attr('content'));
  assert($('a.skip-link[href="#main"]').length);
  assert($('footer').text().includes('Government affiliation and endorsement are not verified.'));
  assert($('.prototype-bar').text().includes('No live government transactions.'));
  assert($('nav[aria-label="Breadcrumb"]').length);
  assert.equal($('input[type="file"],input[type="email"],input[type="password"],textarea').length,0,'Prototype must not collect private records');
  const ids = $('[id]').map((_,e)=>$(e).attr('id')).get();
  assert.equal(new Set(ids).size,ids.length,`${file}: duplicate IDs`);
  $('img').each((_,e)=>assert($(e).attr('alt') !== undefined,`${file}: image alt required`));
  const references = $('[src],link[href],a[href]').toArray();
  for (const el of references) {
    const ref = $(el).attr('src') || $(el).attr('href');
    assert(ref && ref !== '#',`${file}: no placeholder links`);
    if (/^https?:/.test(ref)) {
      assert(el.tagName === 'a' || (el.tagName === 'link' && $(el).attr('rel') === 'canonical'),`${file}: no external runtime assets`);
      continue;
    }
    const url = new URL(ref,`https://onenam.africa/${file === 'index.html'?'':file}`);
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
for (const f of files.filter(f=>f!=='404.html')) assert(sitemap('loc').toArray().some(e=>sitemap(e).text()===`https://onenam.africa/${f==='index.html'?'':f}`),`Sitemap missing ${f}`);
const sw = await read('dist/sw.js');
const handlers = {};
runInNewContext(sw, {
  self: { location:{origin:'https://onenam.africa'}, addEventListener:(type,handler)=>{handlers[type]=handler;} },
  URL,
  caches: { open:async()=>({match:async()=>new Response('public page')}) },
  fetch:async()=>new Response('network'),
});
const cacheCases = [
  ['/', 'GET', true], ['/privacy.html','GET',true], ['/assets/global.css','GET',true],
  ['/?code=sensitive','GET',false], ['/privacy.html?session=sensitive','GET',false],
  ['/auth/callback','GET',false], ['/api/session','GET',false], ['/unknown.html','GET',false],
  ['/citizen-dashboard.html','GET',false], ['/staff-cases.html','GET',false], ['/payments.html','GET',false], ['/receipt.html','GET',false],
  ['/', 'POST', false], ['https://other.example/','GET',false],
];
for (const [path,method,expected] of cacheCases) {
  let intercepted = false;
  let response;
  handlers.fetch({request:{url:new URL(path,'https://onenam.africa').href,method},respondWith:value=>{intercepted=true;response=value;}});
  assert.equal(intercepted,expected,`Offline cache boundary: ${method} ${path}`);
  if (response) await response;
}
// Force a genuine worker-network failure: browser offline emulation does not
// consistently apply to worker-originated requests across browser engines.
const failureHandlers = {};
runInNewContext(sw, {
  self: { location:{origin:'https://onenam.africa'}, addEventListener:(type,handler)=>{failureHandlers[type]=handler;} },
  URL,
  caches: { open:async()=>({match:async path=>path==='/offline.html'?new Response('offline guide'):undefined}) },
  fetch:async()=>{throw new Error('simulated network failure');},
});
for (const [path,mode] of [['/privacy.html','navigate'],['/assets/app.js','cors']]) {
  let response;
  failureHandlers.fetch({request:{url:`https://onenam.africa${path}`,method:'GET',mode},respondWith:value=>{response=value;}});
  if (mode === 'navigate') assert.equal(await (await response).text(),'offline guide');
  else await assert.rejects(response,/simulated network failure/);
}
console.log(`Design gate passed: ${files.length} pages, shared tokens, links, metadata, honest auth, offline boundary; ${Math.round(total/1024)} KiB.`);
