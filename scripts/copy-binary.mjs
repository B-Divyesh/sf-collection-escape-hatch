import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist/bin', { recursive: true });
await copyFile('target/release/escape-hatch', 'dist/bin/escape-hatch');
console.log('copied dist/bin/escape-hatch');
