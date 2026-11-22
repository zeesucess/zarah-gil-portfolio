import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.gif': 'image/gif',
  '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml', '.pdf': 'application/pdf', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
};
const assets = Object.create(null);
async function collect(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || (!prefix && entry.name === 'server')) continue;
    const path = join(directory, entry.name);
    const route = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) await collect(path, route);
    else {
      const type = types[extname(path).toLowerCase()] || 'application/octet-stream';
      assets[route] = [type, (await readFile(path)).toString('base64')];
    }
  }
}

await collect('dist');
await mkdir('dist/server', { recursive: true });
const worker = await readFile('worker/index.mjs', 'utf8');
await writeFile('dist/server/index.js', `const assets = ${JSON.stringify(assets)};\n${worker}`);
