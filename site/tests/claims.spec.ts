import { test, expect } from '@playwright/test';
import { execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { access, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const execFileAsync = promisify(execFile);
const cli = resolve('dist/bin/escape-hatch');
const source = resolve('fixtures/postman-complete.json');
const lossy = resolve('fixtures/hoppscotch-lossy.json');

test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name === 'mobile', 'claim contracts run once in desktop Chromium'));

function run(args: string[]) {
  return spawnSync(cli, args, { encoding: 'utf8' });
}

test('@claim:one-click-demo opens a finished isolated browser report', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page).toHaveTitle('Demo — Collection Escape Hatch');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  await expect(page.getByText('METHOD_CHANGED')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start for real' })).toBeVisible();
});

test('@claim:isolated-cli-demo writes only to a new temporary workspace', async () => {
  const caller = await mkdtemp(join(tmpdir(), 'escape-hatch-claim-caller-'));
  await writeFile(join(caller, 'keep.txt'), 'untouched');
  const result = spawnSync(cli, ['demo'], { cwd: caller, encoding: 'utf8' });
  expect(result.status).toBe(0);
  const reportPath = result.stdout.split('\n').find(line => line.startsWith('Report: '))?.slice('Report: '.length);
  expect(reportPath).toBeTruthy();
  expect(reportPath?.startsWith(tmpdir())).toBeTruthy();
  expect(reportPath?.startsWith(caller)).toBeFalsy();
  expect(await readdir(caller)).toEqual(['keep.txt']);
  expect(await readFile(join(caller, 'keep.txt'), 'utf8')).toBe('untouched');
  const report = await readFile(reportPath!, 'utf8');
  for (const code of ['REQUEST_MISSING', 'METHOD_CHANGED', 'AUTH_CHANGED', 'BODY_MODE_CHANGED', 'SCRIPT_MISSING']) expect(report).toContain(code);
});

test('@claim:supported-formats compares every documented input format', async () => {
  const hoppscotch = run(['compare', '--source', source, '--target', resolve('fixtures/hoppscotch-complete.json'), '--json']);
  expect(hoppscotch.status).toBe(0);
  expect(JSON.parse(hoppscotch.stdout).target_format).toBe('hoppscotch');

  const brunoDirectory = run(['compare', '--source', source, '--target', resolve('fixtures/bruno'), '--json', '--fail-on', 'never']);
  expect(brunoDirectory.status).toBe(0);
  expect(JSON.parse(brunoDirectory.stdout).target_format).toBe('bruno');

  const directory = await mkdtemp(join(tmpdir(), 'escape-hatch-bruno-json-'));
  const brunoJsonPath = join(directory, 'collection.json');
  await writeFile(brunoJsonPath, JSON.stringify({
    name: 'Acme Orders', variables: [{ key: 'baseUrl', value: 'https://api.example.test' }],
    items: [
      { name: 'Orders', items: [{ name: 'Create order', request: { method: 'POST', url: '{{baseUrl}}/orders', auth: { mode: 'bearer' }, body: { mode: 'json', json: '{"sku":"A-100"}' } } }] },
      { name: 'Health', request: { method: 'GET', url: '{{baseUrl}}/health', auth: { mode: 'none' } } }
    ]
  }));
  const brunoJson = run(['compare', '--source', source, '--target', brunoJsonPath, '--json', '--fail-on', 'never']);
  expect(brunoJson.status).toBe(0);
  expect(JSON.parse(brunoJson.stdout).target_format).toBe('bruno-json');
});

test('@claim:field-coverage reports every advertised structural field', async () => {
  const comparison = run(['compare', '--source', source, '--target', lossy, '--source-environment', resolve('fixtures/postman-environment.json'), '--target-environment', resolve('fixtures/hoppscotch-environment.json'), '--json', '--fail-on', 'never']);
  const report = JSON.parse(comparison.stdout);
  const codes = new Set(report.findings.map((finding: { code: string }) => finding.code));
  for (const code of ['REQUEST_MISSING', 'METHOD_CHANGED', 'AUTH_CHANGED', 'BODY_MODE_CHANGED', 'BODY_SIZE_CHANGED', 'SCRIPT_MISSING', 'EXAMPLE_MISSING', 'VARIABLE_MISSING', 'VARIABLE_POPULATION_CHANGED', 'VARIABLE_VALUE_CHANGED']) expect(codes).toContain(code);
  expect(report.findings.some((finding: { path: string }) => finding.path === 'Orders/Create order')).toBeTruthy();

  const query = run(['compare', '--source', resolve('fixtures/postman-query-secret-source.json'), '--target', resolve('fixtures/hoppscotch-query-secret-target.json'), '--json', '--fail-on', 'never']);
  expect(JSON.parse(query.stdout).findings.some((finding: { code: string }) => finding.code === 'URL_CHANGED')).toBeTruthy();

  const directory = await mkdtemp(join(tmpdir(), 'escape-hatch-field-coverage-'));
  const coverageSource = join(directory, 'source.json');
  const coverageTarget = join(directory, 'target.json');
  await writeFile(coverageSource, JSON.stringify({
    info: { name: 'Coverage', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
    variable: [{ key: 'region', value: 'west', type: 'secret' }, { key: 'removed', value: 'present' }],
    item: [
      { name: 'Scope', variable: [{ key: 'folder_value', value: 'present' }], item: [{
        name: 'All fields', request: { method: 'POST', url: 'https://example.test/source', auth: { type: 'bearer' }, body: { mode: 'raw', raw: 'abc' } },
        event: [{ listen: 'test', script: { exec: ['first line', 'second line'] } }], response: [{ name: 'Saved', code: 200, body: 'abc' }]
      }] },
      { name: 'Removed folder', item: [{ name: 'Removed request', request: { method: 'GET', url: 'https://example.test/removed' } }] }
    ]
  }));
  await writeFile(coverageTarget, JSON.stringify({
    v: 8, name: 'Coverage import', variables: [{ key: 'region', value: 'east' }], requests: [],
    folders: [{ name: 'Scope', variables: [], folders: [], requests: [{
      name: 'All fields', method: 'PUT', endpoint: 'https://example.test/target', auth: { authType: 'inherit' },
      body: { contentType: 'none', body: '' }, testScript: 'changed line', responses: [{ name: 'Saved', status: 201, body: 'abcdef' }]
    }] }]
  }));
  const coverage = JSON.parse(run(['compare', '--source', coverageSource, '--target', coverageTarget, '--json', '--fail-on', 'never']).stdout);
  const coverageCodes = new Set<string>(coverage.findings.map((finding: { code: string }) => finding.code));
  for (const code of [
    'FOLDER_MISSING', 'REQUEST_MISSING', 'METHOD_CHANGED', 'URL_CHANGED', 'AUTH_INHERITED_UNVERIFIED',
    'BODY_MODE_CHANGED', 'BODY_SIZE_CHANGED', 'SCRIPT_SIZE_CHANGED', 'SCRIPT_CONTENT_CHANGED',
    'EXAMPLE_STATUS_CHANGED', 'EXAMPLE_SIZE_CHANGED', 'VARIABLE_MISSING', 'VARIABLE_SECRET_DOWNGRADED', 'VARIABLE_VALUE_CHANGED'
  ]) expect(coverageCodes).toContain(code);
  expect(coverage.findings.filter((finding: { path: string }) => finding.path === 'Scope/All fields').length).toBeGreaterThan(6);
});

test('@claim:local-private compares without requests, uploads, telemetry, or script execution', async ({ page }) => {
  let trapHits = 0;
  const trap = createServer((_request, response) => { trapHits += 1; response.end('unexpected'); });
  await new Promise<void>(resolveListen => trap.listen(0, '127.0.0.1', resolveListen));
  const address = trap.address();
  if (!address || typeof address === 'string') throw new Error('trap server did not bind');
  const directory = await mkdtemp(join(tmpdir(), 'escape-hatch-trap-'));
  const trapSource = join(directory, 'source.json');
  const trapTarget = join(directory, 'target.json');
  const scriptMarker = join(directory, 'script-ran');
  await writeFile(trapSource, JSON.stringify({ info: { name: 'Trap', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' }, item: [{ name: 'Trap request', request: { method: 'GET', url: `http://127.0.0.1:${address.port}/must-not-run` }, event: [{ listen: 'test', script: { exec: [`write ${scriptMarker}`] } }] }] }));
  await writeFile(trapTarget, JSON.stringify({ v: 8, name: 'Trap import', folders: [], requests: [{ name: 'Trap request', method: 'GET', endpoint: `http://127.0.0.1:${address.port}/must-not-run`, testScript: `write ${scriptMarker}` }] }));
  await execFileAsync(cli, ['compare', '--source', trapSource, '--target', trapTarget, '--json']);
  await new Promise(resolveWait => setTimeout(resolveWait, 50));
  trap.close();
  expect(trapHits).toBe(0);
  await expect(access(scriptMarker)).rejects.toThrow();
  expect(await readFile(resolve('Cargo.lock'), 'utf8')).not.toMatch(/reqwest|hyper|ureq|telemetry|analytics/i);

  const browserRequests: { origin: string; method: string; hasBody: boolean }[] = [];
  page.on('request', request => browserRequests.push({ origin: new URL(request.url()).origin, method: request.method(), hasBody: Boolean(request.postData()) }));
  await page.goto('/');
  await page.locator('#source-file').setInputFiles(source);
  await page.locator('#target-file').setInputFiles(lossy);
  await page.getByRole('button', { name: 'Compare exports' }).click();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  expect(new Set(browserRequests.map(request => request.origin))).toEqual(new Set([new URL(page.url()).origin]));
  expect(browserRequests.every(request => ['GET', 'HEAD'].includes(request.method) && !request.hasBody)).toBeTruthy();
});

test('@claim:secret-redaction removes every documented secret value', async ({ page }) => {
  const directory = await mkdtemp(join(tmpdir(), 'escape-hatch-secrets-'));
  const names = ['token', 'ACCESS_TOKEN', 'id-token', 'refresh.token', 'api_key', 'apikey', 'key', 'secret', 'client-secret', 'signature', 'sig', 'authorization', 'credential', 'password', 'session', 'jwt'];
  const sourceSecrets = names.map((_, index) => `SOURCE_SENTINEL_${index}`);
  const targetSecrets = names.map((_, index) => `TARGET_SENTINEL_${index}`);
  const queryString = (values: string[]) => names.map((name, index) => `${name}=${values[index]}`).join('&');
  const sourcePath = join(directory, 'source.json');
  const targetPath = join(directory, 'target.json');
  await writeFile(sourcePath, JSON.stringify({ info: { name: 'Secrets', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' }, variable: [{ key: 'api_token', value: 'VARIABLE_SENTINEL', type: 'secret' }], item: [{ name: 'Secrets', request: { method: 'GET', url: `https://user:AUTHORITY_SENTINEL@example.test/items?${queryString(sourceSecrets)}`, header: [{ key: 'Authorization', value: 'HEADER_SENTINEL' }] } }] }));
  await writeFile(targetPath, JSON.stringify({ v: 8, name: 'Secrets', variables: [{ key: 'api_token', value: 'TARGET_VARIABLE_SENTINEL', type: 'secret' }], folders: [], requests: [{ name: 'Secrets', method: 'GET', endpoint: `https://other:TARGET_AUTHORITY@example.test/items?${queryString(targetSecrets)}` }] }));
  for (const format of ['json', 'markdown']) {
    const result = run(['compare', '--source', sourcePath, '--target', targetPath, '--format', format, '--fail-on', 'never']);
    const outputPath = join(directory, `redacted.${format === 'json' ? 'json' : 'md'}`);
    const fileResult = run(['compare', '--source', sourcePath, '--target', targetPath, '--format', format, '--fail-on', 'never', '--output', outputPath]);
    const combined = `${result.stdout}\n${result.stderr}\n${fileResult.stdout}\n${fileResult.stderr}\n${await readFile(outputPath, 'utf8')}`;
    for (const sentinel of [...sourceSecrets, ...targetSecrets, 'VARIABLE_SENTINEL', 'TARGET_VARIABLE_SENTINEL', 'AUTHORITY_SENTINEL', 'TARGET_AUTHORITY', 'HEADER_SENTINEL']) expect(combined).not.toContain(sentinel);
    expect(combined).toContain('[redacted]');
    expect(combined).toContain('[credentials-redacted]');
  }
  await page.goto('/');
  await page.locator('#source-file').setInputFiles(sourcePath);
  await page.locator('#target-file').setInputFiles(targetPath);
  await page.getByRole('button', { name: 'Compare exports' }).click();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  for (const sentinel of [...sourceSecrets, ...targetSecrets, 'VARIABLE_SENTINEL', 'TARGET_VARIABLE_SENTINEL', 'AUTHORITY_SENTINEL', 'TARGET_AUTHORITY', 'HEADER_SENTINEL']) {
    await expect(page.locator('body')).not.toContainText(sentinel);
  }
});

test('@claim:report-formats writes stable Markdown and JSON', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'escape-hatch-reports-'));
  for (const format of ['json', 'markdown']) {
    const first = run(['compare', '--source', source, '--target', lossy, '--format', format, '--fail-on', 'never']);
    const second = run(['compare', '--source', source, '--target', lossy, '--format', format, '--fail-on', 'never']);
    expect(first.status).toBe(0);
    expect(second.stdout).toBe(first.stdout);
    const outputPath = join(directory, `report.${format === 'json' ? 'json' : 'md'}`);
    const written = run(['compare', '--source', source, '--target', lossy, '--format', format, '--fail-on', 'never', '--output', outputPath]);
    expect(written.stdout).toBe('');
    expect(await readFile(outputPath, 'utf8')).toBe(first.stdout);
  }
  expect(JSON.parse(run(['compare', '--source', source, '--target', lossy, '--json', '--fail-on', 'never']).stdout).schema).toBe('escape-hatch.report/v1');
});

test('@claim:finding-contract exposes report fields and documented exit codes', () => {
  const good = run(['compare', '--source', source, '--target', resolve('fixtures/hoppscotch-complete.json'), '--json']);
  const findings = run(['compare', '--source', source, '--target', lossy, '--json']);
  const invalid = run(['compare', '--source', resolve('fixtures/hoppscotch-complete.json'), '--target', lossy]);
  expect([good.status, findings.status, invalid.status]).toEqual([0, 1, 2]);
  for (const finding of JSON.parse(findings.stdout).findings) expect(Object.keys(finding).sort()).toEqual(['category', 'code', 'evidence', 'message', 'path', 'severity']);
});

test('@claim:browser-isolation keeps demo and selected files out of persistent storage', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => { localStorage.setItem('real:sentinel', 'keep'); sessionStorage.setItem('real:session', 'keep'); });
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.locator('#source-file').setInputFiles(source);
  await page.locator('#target-file').setInputFiles(lossy);
  await page.getByRole('button', { name: 'Compare exports' }).click();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  await page.locator('[data-enter-demo]').click();
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).first().click();
  await page.locator('#source-file').setInputFiles({ name: 'too-large.json', mimeType: 'application/json', buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 32) });
  await expect(page.getByText(/over the 10 MB browser demo limit/)).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).first().click();
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator('#source-name')).toHaveText('postman-complete.json');
  await expect(page.locator('#target-name')).toHaveText('hoppscotch-lossy.json');
  const state = await page.evaluate(async () => {
    const cacheKeys = 'caches' in window ? await caches.keys() : [];
    const cacheEntries = (await Promise.all(cacheKeys.map(async key => (await caches.open(key)).keys()))).flat().map(request => new URL(request.url).pathname);
    const opfsEntries: string[] = [];
    const storage = navigator.storage as StorageManager & { getDirectory?: () => Promise<FileSystemDirectoryHandle> };
    if (storage.getDirectory) {
      const root = await storage.getDirectory();
      for await (const [name] of root.entries()) opfsEntries.push(name);
    }
    return { local: { ...localStorage }, session: { ...sessionStorage }, databases: await indexedDB.databases(), cacheKeys, cacheEntries, opfsEntries };
  });
  expect(state.local).toEqual({ 'real:sentinel': 'keep' });
  expect(state.session).toEqual({ 'real:session': 'keep' });
  expect(state.databases).toEqual([]);
  expect(state.opfsEntries).toEqual([]);
  expect(state.cacheKeys.every(key => key === 'escape-hatch-v2')).toBeTruthy();
  expect(state.cacheEntries.some(path => path.includes('postman-complete') || path.includes('hoppscotch-lossy'))).toBeFalsy();
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBeTruthy();
  expect(await context.cookies()).toEqual([]);
  await context.clearCookies();
});

test('@claim:offline-reload reloads and resets the demo offline', async ({ page, context }) => {
  await page.goto('/?demo=1');
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  await page.evaluate(async () => {
    if (!navigator.serviceWorker.controller) await new Promise<void>(resolveReady => navigator.serviceWorker.addEventListener('controllerchange', () => resolveReady(), { once: true }));
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle('Demo — Collection Escape Hatch');
  await expect(page.getByText('Changes found', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).first().click();
  await expect(page.getByText('METHOD_CHANGED')).toBeVisible();
});

test('@claim:one-binary-no-account ships one executable and demos without sign-in', async () => {
  expect(await readdir(resolve('dist/bin'))).toEqual(['escape-hatch']);
  const result = run(['demo']);
  expect(result.status).toBe(0);
  expect(`${result.stdout}${result.stderr}`).not.toMatch(/sign[ -]?in|log[ -]?in|account required|password prompt/i);
  expect(result.stdout).toContain('Report: ');
});

test('@claim:build-contract creates the documented release outputs', async () => {
  expect((await readdir(resolve('dist/bin')))).toContain('escape-hatch');
  expect((await readdir(resolve('dist/site')))).toContain('index.html');
  expect((await readdir(resolve('dist/site')))).toContain('demo');
});

test('@claim:mit-license includes the MIT grant', async () => {
  const license = await readFile(resolve('LICENSE'), 'utf8');
  expect(license).toContain('MIT License');
  expect(license).toContain('Permission is hereby granted, free of charge');
});
