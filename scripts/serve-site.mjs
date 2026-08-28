import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../dist/site/', import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
  if (['/demo', '/privacy', '/terms'].includes(pathname)) {
    response.writeHead(301, { Location: `${pathname}/` });
    response.end();
    return;
  }
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let candidate = normalize(join(root, relative));
  if (!candidate.startsWith(root)) candidate = join(root, 'not-found.html');
  try {
    if ((await stat(candidate)).isDirectory()) candidate = join(candidate, 'index.html');
    const body = await readFile(candidate);
    response.writeHead(200, { 'Content-Type': types[extname(candidate)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(body);
  } catch {
    const body = await readFile(join(root, 'not-found.html'));
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    response.end(body);
  }
}).listen(port, '127.0.0.1', () => console.log(`static site listening on http://127.0.0.1:${port}`));
