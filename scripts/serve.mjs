import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.xml':'application/xml','.txt':'text/plain'};
createServer(async (req,res) => {
  try {
    const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root+sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'}).end(body);
  } catch {
    try {
      const fallback = await readFile(resolve(root,'404.html'));
      res.writeHead(404, {'Content-Type':'text/html; charset=utf-8'}).end(fallback);
    } catch {
      res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}).end('Page not found.');
    }
  }
}).listen(4173,'127.0.0.1',() => console.log('OneNam preview: http://127.0.0.1:4173'));
