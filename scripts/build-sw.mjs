import { readFile, writeFile, readdir } from 'node:fs/promises';

const assets = (await readdir('dist/site/assets')).map(name => `/assets/${name}`);
const shell = ['/', '/index.html', '/privacy/', '/privacy/index.html', '/terms/', '/terms/index.html', '/blueprint-crossing.webp', ...assets];
const path = 'dist/site/sw.js';
const source = await readFile(path, 'utf8');
await writeFile(path, source.replace('/* __PRECACHE__ */ []', JSON.stringify(shell)));
console.log(`precache manifest: ${shell.length} files`);
