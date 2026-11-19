import {mkdir,writeFile,readFile,cp,readdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname,basename} from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {pages} from './pages.mjs';
import {layout} from './ui.mjs';
const output=resolve('dist');
assert(dirname(output)===process.cwd()&&basename(output)==='dist');
await rm(output,{recursive:true,force:true});
await mkdir('dist/assets',{recursive:true});
await cp('assets','dist/assets',{recursive:true});
await mkdir('dist/wireframes',{recursive:true});
for(const name of ['desktop.svg','mobile.svg'])await cp(`docs/wireframes/${name}`,`dist/wireframes/${name}`);
await cp('CNAME','dist/CNAME');
await writeFile('dist/.nojekyll','');
const mark='dist/assets/namibone-mark';
for(const size of [32,180,192,512])await sharp(`${mark}.svg`).resize(size).png().toFile(`${mark}-${size}.png`);
for (const page of pages) {
  const file = resolve(output, page.path === '/' ? 'index.html' : page.path.slice(1));
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, layout(page));
}
await writeFile('dist/manifest.webmanifest',JSON.stringify({name:'NamibOne digital gateway',short_name:'NamibOne',id:'/',start_url:'/',scope:'/',display:'standalone',background_color:'#f6f2e9',theme_color:'#124f50',description:'Independent public-service prototype for Namibia.',icons:[192,512].map(s=>({src:`/assets/namibone-mark-${s}.png`,sizes:`${s}x${s}`,type:'image/png',purpose:'any'}))},null,2));
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p=>p.path!=='/404.html').map(p=>`<url><loc>https://namibone.com${p.path}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\nSitemap: https://namibone.com/sitemap.xml\n');
const isPublicOffline=page=>(page.section??'public')==='public'&&page.offline!==false;
const publicPages=pages.filter(isPublicOffline).map(p=>p.path);
const assets=(await readdir('dist/assets')).map(f=>`/assets/${f}`);
const precache=[...publicPages,'/index.html',...assets,'/manifest.webmanifest'];
await writeFile('dist/offline-manifest.json',JSON.stringify(precache));
const hash=createHash('sha256');
for(const p of precache)hash.update(await readFile(`dist${p==='/'?'/index.html':p}`));
const version=hash.digest('hex').slice(0,16);
await writeFile('dist/sw.js',`const CACHE='onenam-${version}';
const PUBLIC=new Set(${JSON.stringify(precache)});

self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(Array.from(PUBLIC,path=>new Request(new URL(path,self.location.origin),{cache:'reload'})));
 await self.skipWaiting();
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys()){
  if(key.startsWith('onenam-')&&key!==CACHE)await caches.delete(key);
 }
 await self.clients.claim();
})()));

async function servePublic(request,path){
 try{
  return await fetch(request,{cache:'no-cache'});
 }catch(error){
  const cache=await caches.open(CACHE);
  const saved=await cache.match(path);
  if(saved)return saved;
  if(request.mode==='navigate'){
   const fallback=await cache.match('/offline.html');
   if(fallback)return fallback;
  }
  throw error;
 }
}

self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.search||!PUBLIC.has(url.pathname))return;
 event.respondWith(servePublic(event.request,url.pathname));
});`);
await writeFile('dist/page-manifest.json',JSON.stringify(pages.map(page=>({path:page.path,title:page.title,section:page.section??'public',offline:isPublicOffline(page)})),null,2));
console.log(`Built ${pages.length} pages; ${publicPages.length} public offline routes. Version ${version}.`);
