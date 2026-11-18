import { readFile, readdir, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import postcss from 'postcss';
const read = p => readFile(p,'utf8');
const css = await read('dist/assets/global.css');
const tokens = await read('dist/assets/tokens.css');
const declared = new Set();
postcss.parse(tokens).walkDecls(d => declared.add(d.prop));
postcss.parse(css).walkDecls(d => {
  assert(!/#[\da-f]{3,8}\b|\brgba?\(|\bhsla?\(/i.test(d.value), `Use a shared color token: ${d.toString()}`);
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
assert(total < 650_000, `Public page/assets budget exceeded: ${total} bytes`);
for (const file of files) {
  const $ = load(await read(`dist/${file}`));
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
const home = load(await read('dist/index.html'));
assert.equal(home('button.provider[disabled]').length,3,'All unconfigured providers must stay disabled');
assert.equal(home('form').length,0,'No personal-data forms until authentication is configured');
const sitemap = load(await read('dist/sitemap.xml'),{xml:true});
for (const f of files.filter(f=>f!=='404.html')) assert(sitemap('loc').toArray().some(e=>sitemap(e).text()===`https://onenam.africa/${f==='index.html'?'':f}`),`Sitemap missing ${f}`);
const sw = await read('dist/sw.js');
assert(sw.includes("url.search || !PUBLIC.includes(url.pathname)"),'Offline cache must allowlist only public files without query parameters');
console.log(`Design gate passed: ${files.length} pages, shared tokens, links, metadata, honest auth, offline boundary; ${Math.round(total/1024)} KiB.`);
