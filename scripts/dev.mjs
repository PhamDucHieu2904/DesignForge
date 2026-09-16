import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const build = spawn(process.execPath, ['scripts/build.mjs'], { stdio: 'inherit' });
const buildCode = await new Promise((resolve, reject) => {
  build.once('error', reject);
  build.once('close', resolve);
});
if (buildCode !== 0) process.exit(buildCode ?? 1);

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  const requested = normalize(req.url?.split('?')[0] || '/').replace(/^([.][.][\\/])+/, '');
  const path = requested === '/' ? 'dist/index.html' : join('dist', requested);
  try {
    const body = await readFile(path);
    res.writeHead(200, { 'content-type': mime[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    const body = await readFile('dist/index.html');
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(body);
  }
});
server.listen(4173, '127.0.0.1', () => console.log('DesignForge preview: http://127.0.0.1:4173'));
