import './styles.css';
import { registerServiceWorker, setupCommonShell } from './common';

type Item = { name?: string; item?: Item[]; request?: { method?: string; url?: string | { raw?: string }; auth?: { type?: string }; body?: { mode?: string; raw?: string } }; event?: unknown[]; response?: unknown[] };
type HopRequest = { name?: string; method?: string; endpoint?: string; auth?: { authType?: string }; body?: { contentType?: string; body?: string }; testScript?: string; preRequestScript?: string; responses?: unknown[] };
type HopFolder = { name?: string; folders?: HopFolder[]; requests?: HopRequest[] };
type Finding = { code: string; path: string; note: string };
type DemoState = { source: unknown; target: unknown; sourceName: string; targetName: string };
type RequestShape = { method: string; url: string; auth: string; body: string; bytes: number; scripts: number; examples: number };

const sampleSource = {
  info: { name: 'Acme Orders', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  variable: [{ key: 'baseUrl', value: '[held in memory]' }, { key: 'api_token', value: '[held in memory]' }],
  item: [{ name: 'Orders', item: [{ name: 'Create order', request: { method: 'POST', url: { raw: '{{baseUrl}}/orders' }, auth: { type: 'bearer' }, body: { mode: 'raw', raw: '{"sku":"A-100"}' } }, event: [{}], response: [{}] }] }, { name: 'Health', request: { method: 'GET', url: '{{baseUrl}}/health', auth: { type: 'noauth' } } }]
};
const sampleTarget = { v: 8, name: 'Acme imported', variables: [{ key: 'baseUrl', value: '' }], folders: [{ name: 'Orders', folders: [], requests: [{ name: 'Create order', method: 'PUT', endpoint: '{{baseUrl}}/orders', auth: { authType: 'none' }, body: { contentType: 'none', body: '' }, testScript: '', responses: [] }] }], requests: [] };

const realState: DemoState = { source: null, target: null, sourceName: 'No source selected', targetName: 'No target selected' };
const demoState: DemoState = { source: null, target: null, sourceName: 'acme-orders.postman.json · bundled sample', targetName: 'acme-orders-lossy.hoppscotch.json · bundled sample' };
let demoMode = location.pathname === '/demo' || location.pathname === '/demo/' || new URLSearchParams(location.search).get('demo') === '1';

const sourceInput = optional<HTMLInputElement>('source-file');
const targetInput = optional<HTMLInputElement>('target-file');
const output = optional<HTMLElement>('report-output');
const verdict = optional<HTMLElement>('report-verdict');

setupCommonShell();
registerServiceWorker();

sourceInput?.addEventListener('change', () => selectFile(sourceInput, true));
targetInput?.addEventListener('change', () => selectFile(targetInput, false));
optional('load-sample')?.addEventListener('click', () => enterDemo(true));
optional('run-demo')?.addEventListener('click', () => runComparison());
optional('clear-demo')?.addEventListener('click', () => demoMode ? resetDemo() : clearReal());
optional('reset-demo-banner')?.addEventListener('click', resetDemo);
document.querySelectorAll<HTMLAnchorElement>('[data-enter-demo]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  enterDemo(true);
}));
optional('start-real')?.addEventListener('click', () => {
  demoState.source = null;
  demoState.target = null;
  location.replace('/');
});

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const copy = button.dataset.copy ?? '';
  try {
    await navigator.clipboard.writeText(copy);
    const old = button.textContent;
    button.textContent = 'Install command copied';
    window.setTimeout(() => { button.textContent = old; }, 1500);
  } catch {
    button.textContent = 'Select the command to copy';
  }
}));

optional('replay-trace')?.addEventListener('click', async event => {
  const button = event.currentTarget as HTMLButtonElement;
  const lines = [...document.querySelectorAll<HTMLElement>('[data-trace]')];
  lines.forEach(line => { line.hidden = true; });
  button.disabled = true;
  button.textContent = 'Replaying…';
  for (const line of lines) {
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) await wait(450);
    line.hidden = false;
  }
  button.disabled = false;
  button.textContent = 'Replay CLI comparison';
});

if (demoMode && output) {
  enterDemo(false);
  if (new URLSearchParams(location.search).get('demo') === '1') {
    requestAnimationFrame(focusDemo);
  }
}

addEventListener('popstate', () => {
  const routeIsDemo = location.pathname === '/demo' || location.pathname === '/demo/' || new URLSearchParams(location.search).get('demo') === '1';
  if (routeIsDemo && !demoMode) {
    enterDemo(false);
    requestAnimationFrame(focusDemo);
  } else if (!routeIsDemo && demoMode && location.pathname === '/') {
    demoMode = false;
    demoState.source = null;
    demoState.target = null;
    optional('demo-banner')?.setAttribute('hidden', '');
    document.body.classList.remove('demo-mode');
    document.title = 'Collection Escape Hatch — compare Postman migrations';
    setCanonical('https://collection-escape-hatch.sociobot.in/');
    setMeta('meta[name="description"]', 'Compare Postman exports with Bruno or Hoppscotch and find missing migration data before your team switches clients.');
    setMeta('meta[property="og:title"]', 'Compare your Postman migration exports');
    setMeta('meta[property="og:description"]', 'Compare Postman exports with Bruno or Hoppscotch and find missing migration data before your team switches clients.');
    setMeta('meta[property="og:url"]', 'https://collection-escape-hatch.sociobot.in/');
    setMeta('meta[name="twitter:title"]', 'Compare your Postman migration exports');
    setMeta('meta[name="twitter:description"]', 'Compare Postman exports with Bruno or Hoppscotch before your team switches clients.');
    renderRealState();
    focusPageHeading('hero-title', 'Home loaded');
  }
});

function optional<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function activeState() { return demoMode ? demoState : realState; }

function enterDemo(updateUrl: boolean) {
  demoMode = true;
  demoState.source = structuredClone(sampleSource);
  demoState.target = structuredClone(sampleTarget);
  optional('demo-banner')?.removeAttribute('hidden');
  document.body.classList.add('demo-mode');
  const sourceName = optional('source-name');
  const targetName = optional('target-name');
  if (sourceName) sourceName.textContent = 'acme-orders.postman.json · bundled sample';
  if (targetName) targetName.textContent = 'acme-orders-lossy.hoppscotch.json · bundled sample';
  const resetButton = optional('clear-demo');
  if (resetButton) resetButton.textContent = 'Reset demo';
  if (updateUrl && location.pathname === '/') history.pushState({ demo: true }, '', '/?demo=1');
  document.title = 'Demo — Collection Escape Hatch';
  setCanonical('https://collection-escape-hatch.sociobot.in/demo/');
  setMeta('meta[name="description"]', 'Try a local Postman-to-Hoppscotch migration comparison with isolated sample data.');
  setMeta('meta[property="og:title"]', 'Demo — Collection Escape Hatch');
  setMeta('meta[property="og:description"]', 'Try a local Postman-to-Hoppscotch migration comparison with isolated sample data.');
  setMeta('meta[property="og:url"]', 'https://collection-escape-hatch.sociobot.in/demo/');
  setMeta('meta[name="twitter:title"]', 'Demo — Collection Escape Hatch');
  setMeta('meta[name="twitter:description"]', 'Try a local migration comparison with isolated sample data.');
  runComparison(true);
  if (updateUrl) requestAnimationFrame(focusDemo);
}

function focusDemo() {
  const mobile = matchMedia('(max-width: 680px)').matches;
  const destination = mobile
    ? document.querySelector<HTMLElement>('.report-panel')
    : document.getElementById('demo');
  destination?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  focusPageHeading('demo-title', 'Browser demo loaded');
}

function focusPageHeading(id: string, fallback: string) {
  const title = optional(id);
  if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
  const announcer = optional('route-announcer');
  if (announcer) announcer.textContent = title?.textContent ?? fallback;
}

function resetDemo() {
  demoState.source = structuredClone(sampleSource);
  demoState.target = structuredClone(sampleTarget);
  if (sourceInput) sourceInput.value = '';
  if (targetInput) targetInput.value = '';
  const sourceName = optional('source-name');
  const targetName = optional('target-name');
  if (sourceName) sourceName.textContent = 'acme-orders.postman.json · bundled sample';
  if (targetName) targetName.textContent = 'acme-orders-lossy.hoppscotch.json · bundled sample';
  runComparison(true);
}

function clearReal() {
  realState.source = null;
  realState.target = null;
  realState.sourceName = 'No source selected';
  realState.targetName = 'No target selected';
  if (sourceInput) sourceInput.value = '';
  if (targetInput) targetInput.value = '';
  const sourceName = optional('source-name');
  const targetName = optional('target-name');
  if (sourceName) sourceName.textContent = 'No source selected';
  if (targetName) targetName.textContent = 'No target selected';
  renderEmpty();
}

function renderEmpty() {
  if (output) {
    output.className = 'empty-report';
    output.innerHTML = '<span class="empty-mark" aria-hidden="true">⌗</span><p><strong>No report yet.</strong><br>Choose both exports or try the sample data.</p>';
  }
  if (verdict) { verdict.className = 'verdict neutral'; verdict.textContent = 'Waiting for exports'; }
}

function renderRealState() {
  const sourceName = optional('source-name');
  const targetName = optional('target-name');
  if (sourceName) sourceName.textContent = realState.sourceName;
  if (targetName) targetName.textContent = realState.targetName;
  if (realState.source && realState.target) runComparison(true); else renderEmpty();
}

async function selectFile(input: HTMLInputElement, source: boolean) {
  const file = input.files?.[0];
  if (!file) return;
  const state = activeState();
  if (source) { state.source = null; state.sourceName = file.name; }
  else { state.target = null; state.targetName = file.name; }
  const name = optional(source ? 'source-name' : 'target-name');
  if (name) name.textContent = file.name;
  if (file.size > 10 * 1024 * 1024) {
    showError(`${file.name} is over the 10 MB browser demo limit. Use the CLI for larger exports.`);
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    if (source) { state.source = parsed; state.sourceName = file.name; }
    else { state.target = parsed; state.targetName = file.name; }
  } catch {
    showError(`${file.name} is not valid JSON. Export the file again and retry.`);
  }
}

async function runComparison(immediate = false) {
  if (!output || !verdict) return;
  const state = activeState();
  if (!state.source || !state.target) {
    showError('Choose both a Postman source and Hoppscotch target, or try the sample data.');
    return;
  }
  output.setAttribute('aria-busy', 'true');
  output.className = 'empty-report';
  output.innerHTML = '<span class="empty-mark" aria-hidden="true">⌁</span><p><strong>Comparing structure…</strong><br>Reading names, scopes, and field shapes on this device.</p>';
  verdict.className = 'verdict loading';
  verdict.textContent = 'Comparing';
  if (!immediate) await wait(220);
  try {
    const report = inspect(state.source as Record<string, unknown>, state.target as Record<string, unknown>);
    renderReport(report.findings, report.counts);
  } catch (error) {
    showError(error instanceof Error ? error.message : 'These exports could not be compared.');
  }
}

function inspect(source: Record<string, unknown>, target: Record<string, unknown>) {
  const schema = (source.info as { schema?: string } | undefined)?.schema ?? '';
  if (!schema.includes('v2.1')) throw new Error('Source is not a Postman Collection v2.1 export. Export the collection as v2.1 and retry.');
  if (!Array.isArray(target.folders) && !Array.isArray(target.requests)) throw new Error('Target is not a Hoppscotch collection export. Use the CLI to compare Bruno exports.');
  const src = new Map<string, RequestShape>();
  const folders = new Set<string>();
  walkSource((source.item ?? []) as Item[], '', src, folders);
  const dst = new Map<string, RequestShape>();
  const targetFolders = new Set<string>();
  walkTarget({ requests: target.requests as HopRequest[] | undefined, folders: target.folders as HopFolder[] | undefined }, '', dst, targetFolders);
  const findings: Finding[] = [];
  folders.forEach(path => { if (!targetFolders.has(path)) findings.push({ code: 'FOLDER_MISSING', path, note: 'Folder absent from target' }); });
  src.forEach((request, path) => {
    const other = dst.get(path);
    if (!other) { findings.push({ code: 'REQUEST_MISSING', path, note: 'Request absent from target' }); return; }
    if (request.method !== other.method) findings.push({ code: 'METHOD_CHANGED', path, note: `${request.method} → ${other.method}` });
    if (request.url !== other.url) findings.push({ code: 'URL_CHANGED', path, note: 'Request URL differs' });
    if (normalizeAuth(request.auth) !== normalizeAuth(other.auth)) findings.push({ code: 'AUTH_CHANGED', path, note: `${normalizeAuth(request.auth)} → ${normalizeAuth(other.auth)}` });
    if (bodyKind(request.body) !== bodyKind(other.body)) findings.push({ code: 'BODY_MODE_CHANGED', path, note: `${bodyKind(request.body)} → ${bodyKind(other.body)}` });
    if (request.bytes !== other.bytes) findings.push({ code: 'BODY_SIZE_CHANGED', path, note: `${request.bytes} B → ${other.bytes} B` });
    if (request.scripts > other.scripts) findings.push({ code: 'SCRIPT_MISSING', path, note: `${request.scripts - other.scripts} event missing` });
    if (request.examples > other.examples) findings.push({ code: 'EXAMPLE_MISSING', path, note: `${request.examples - other.examples} saved example missing` });
  });
  const sourceVars = new Set(((source.variable ?? []) as { key?: string }[]).map(v => v.key).filter(Boolean));
  const targetVars = new Set(((target.variables ?? []) as { key?: string }[]).map(v => v.key).filter(Boolean));
  sourceVars.forEach(name => { if (!targetVars.has(name)) findings.push({ code: 'VARIABLE_MISSING', path: `collection::${name}`, note: 'Name or scope absent · value [redacted]' }); });
  return { findings, counts: { source: src.size, target: dst.size, folders: folders.size, variables: sourceVars.size } };
}

function walkSource(items: Item[], parent: string, result: Map<string, RequestShape>, folders: Set<string>) {
  items.forEach(item => {
    const path = join(parent, item.name ?? 'unnamed');
    if (item.item) { folders.add(path); walkSource(item.item, path, result, folders); return; }
    if (!item.request) return;
    const url = typeof item.request.url === 'string' ? item.request.url : item.request.url?.raw ?? '';
    result.set(path, requestShape((item.request.method ?? 'GET').toUpperCase(), url, item.request.auth?.type ?? 'none', item.request.body?.mode ?? 'none', item.request.body?.raw?.length ?? 0, item.event?.length ?? 0, item.response?.length ?? 0));
  });
}

function walkTarget(node: { requests?: HopRequest[]; folders?: HopFolder[] }, parent: string, result: Map<string, RequestShape>, folders: Set<string>) {
  (node.requests ?? []).forEach(request => {
    const path = join(parent, request.name ?? 'unnamed');
    result.set(path, requestShape((request.method ?? 'GET').toUpperCase(), request.endpoint ?? '', request.auth?.authType ?? 'none', request.body?.contentType ?? 'none', request.body?.body?.length ?? 0, Number(Boolean(request.testScript)) + Number(Boolean(request.preRequestScript)), request.responses?.length ?? 0));
  });
  (node.folders ?? []).forEach(folder => { const path = join(parent, folder.name ?? 'unnamed'); folders.add(path); walkTarget(folder, path, result, folders); });
}

function requestShape(method: string, url: string, auth: string, body: string, bytes: number, scripts: number, examples: number): RequestShape {
  return { method, url, auth, body, bytes, scripts, examples };
}

function renderReport(findings: Finding[], counts: { source: number; target: number; folders: number; variables: number }) {
  if (!output || !verdict) return;
  output.setAttribute('aria-busy', 'false');
  output.className = 'report-results';
  const shown = findings.slice(0, 5);
  output.innerHTML = `<div class="report-summary"><div><strong>${counts.source}</strong><span>source requests</span></div><div><strong>${counts.target}</strong><span>target requests</span></div><div><strong>${findings.length}</strong><span>findings</span></div></div>${findings.length ? `<ul class="findings">${shown.map(f => `<li><span class="finding-icon" aria-hidden="true">!</span><strong>${escapeHtml(f.code)} · ${escapeHtml(f.path)}</strong><small>${escapeHtml(f.note)}</small></li>`).join('')}</ul>${findings.length > shown.length ? `<p class="privacy-note">+ ${findings.length - shown.length} more in the full CLI report</p>` : ''}` : '<div class="empty-report"><span class="empty-mark" aria-hidden="true">✓</span><p><strong>No structural differences found.</strong><br>Run client-specific smoke tests before switching.</p></div>'}`;
  verdict.className = `verdict ${findings.length ? 'bad' : 'good'}`;
  verdict.textContent = findings.length ? 'Changes found' : 'No differences found';
}

function showError(message: string) {
  if (!output || !verdict) return;
  output.setAttribute('aria-busy', 'false');
  output.className = 'empty-report';
  output.innerHTML = `<span class="empty-mark" aria-hidden="true">!</span><p><strong>Comparison stopped.</strong><br>${escapeHtml(message)}</p>`;
  verdict.className = 'verdict bad';
  verdict.textContent = 'Fix the exports';
}

function join(parent: string, name: string) { return parent ? `${parent}/${name.replaceAll('/', '∕')}` : name.replaceAll('/', '∕'); }
function normalizeAuth(value: string) { return value === 'noauth' ? 'none' : value.toLowerCase(); }
function bodyKind(value: string) { return ['raw', 'json', 'application/json'].includes(value.toLowerCase()) ? 'text/json' : value.toLowerCase(); }
function escapeHtml(value: string) { const span = document.createElement('span'); span.textContent = value; return span.innerHTML; }
function wait(ms: number) { return new Promise(resolve => window.setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms)); }
function setCanonical(url: string) { document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', url); }
function setMeta(selector: string, content: string) { document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content); }

function updateNetwork() {
  const state = optional('network-state');
  if (!state) return;
  state.textContent = navigator.onLine ? 'Online · local processing' : 'Offline · browser demo works';
  state.classList.toggle('offline', !navigator.onLine);
}
addEventListener('online', updateNetwork);
addEventListener('offline', updateNetwork);
updateNetwork();
