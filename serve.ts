// Vice Coast Cover Studio — development server.
//
// Serves app/ on http://localhost:8080 so the app can be tried in a
// desktop browser. Static files only, nothing leaves the machine.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = 8080;
const appRoot = join(dirname(fileURLToPath(import.meta.url)), 'app');

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

// Resolve a request path inside app/, or null when it escapes or is no file.
function fileFor(pathname: string): string | null {
  const rel = pathname === '/' ? '/index.html' : pathname;
  const file = resolve(join(appRoot, decodeURIComponent(rel)));
  if (!file.startsWith(appRoot + sep)) return null;
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  return file;
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const file = fileFor(url.pathname);
  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('not found\n');
    return;
  }
  const body = readFileSync(file);
  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'content-length': body.length,
  });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`Vice Coast Cover Studio at http://localhost:${PORT}`);
});
