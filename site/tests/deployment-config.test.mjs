import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const siteRoot = new URL('../../dist/site/', import.meta.url);
const config = JSON.parse(await readFile(new URL('staticwebapp.config.json', siteRoot), 'utf8'));
const immutable = 'public, max-age=31536000, immutable';

assert.equal(
  config.globalHeaders['Cache-Control'],
  'public, max-age=300, must-revalidate',
  'HTML and legal pages must stay revalidating so a deployment can update them.'
);
assert.match(config.globalHeaders['Content-Security-Policy'], /default-src 'self'/);
assert.match(config.globalHeaders['Permissions-Policy'], /camera=\(\)/);

const assetRoute = config.routes.find(route => route.route === '/assets/*');
assert.equal(assetRoute?.headers?.['Cache-Control'], immutable);
const workerRoute = config.routes.find(route => route.route === '/sw.js');
assert.equal(workerRoute?.headers?.['Cache-Control'], 'no-cache, no-store, must-revalidate');

const assetFiles = await readdir(new URL('assets/', siteRoot));
assert(assetFiles.some(file => /^main-.*\.js$/.test(file)), 'the built JavaScript entry must be fingerprinted');
assert(assetFiles.some(file => /^(styles|common)-.*\.css$/.test(file)), 'the built stylesheet must be fingerprinted');
assert.equal(assetFiles.filter(file => /^blueprint-crossing-.*\.webp$/.test(file)).length, 2, 'hero images must be fingerprinted assets');

const html = await readFile(new URL('index.html', siteRoot), 'utf8');
assert.doesNotMatch(html, /src="\/blueprint-crossing\.webp"/, 'unfingerprinted hero URLs must not be shipped');
assert.match(html, /\/assets\/blueprint-crossing-[^"\s]+\.webp/, 'the landing page must reference a fingerprinted hero image');

for (const route of ['index.html', 'demo/index.html', 'privacy/index.html', 'terms/index.html', 'not-found.html']) {
  const page = await readFile(new URL(route, siteRoot), 'utf8');
  assert.match(page, /rel="canonical"/, `${route} must declare its canonical URL`);
  assert.match(page, /property="og:title"/, `${route} must include Open Graph metadata`);
  assert.match(page, /property="og:image" content="https:\/\/collection-escape-hatch\.sociobot\.in\/og-blueprint\.png"/, `${route} must include the product social image`);
  assert.match(page, /name="twitter:card"/, `${route} must include Twitter card metadata`);
  assert.match(page, /apple-touch-icon/, `${route} must include the touch icon`);
  const title = page.match(/<title>(.*?)<\/title>/)?.[1] ?? '';
  const description = page.match(/<meta name="description" content="(.*?)"/)?.[1] ?? '';
  assert(title.length > 0 && title.length <= 60, `${route} title must contain at most 60 characters`);
  assert(description.length > 0 && description.length <= 155, `${route} description must contain at most 155 characters`);
}
const sitemap = await readFile(new URL('sitemap.xml', siteRoot), 'utf8');
for (const route of ['/', '/demo/', '/privacy/', '/terms/']) assert(sitemap.includes(`https://collection-escape-hatch.sociobot.in${route}`));
assert.match(await readFile(new URL('robots.txt', siteRoot), 'utf8'), /Sitemap: https:\/\/collection-escape-hatch\.sociobot\.in\/sitemap\.xml/);
const ogImage = await readFile(new URL('og-blueprint.png', siteRoot));
assert.equal(ogImage.readUInt32BE(16), 1200, 'Open Graph image must be 1200 px wide');
assert.equal(ogImage.readUInt32BE(20), 630, 'Open Graph image must be 630 px tall');
assert.equal(config.navigationFallback, undefined, 'unknown routes must not fall back to the home page');
assert.equal(config.responseOverrides?.['404']?.statusCode, 404, 'unknown routes must use the designed 404 with status 404');

const worker = await readFile(new URL('sw.js', siteRoot), 'utf8');
for (const file of assetFiles) {
  const pathname = `/assets/${file}`;
  assert(worker.includes(pathname), `service worker must precache ${pathname}`);
}

console.log('deployment response policy and fingerprinted asset contract passed');
