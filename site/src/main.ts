import './styles.css';

type Item = { name?: string; item?: Item[]; request?: { method?: string; url?: string | { raw?: string }; auth?: { type?: string }; body?: { mode?: string; raw?: string } }; event?: unknown[]; response?: unknown[] };
type HopRequest = { name?: string; method?: string; endpoint?: string; auth?: { authType?: string }; body?: { contentType?: string; body?: string }; testScript?: string; preRequestScript?: string; responses?: unknown[] };
type HopFolder = { name?: string; folders?: HopFolder[]; requests?: HopRequest[] };
type Finding = { code: string; path: string; note: string };

const sampleSource = {
  info: { name: 'Acme Orders', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  variable: [{ key: 'baseUrl', value: '[held in memory]' }, { key: 'api_token', value: '[held in memory]' }],
  item: [{ name: 'Orders', item: [{ name: 'Create order', request: { method: 'POST', url: { raw: '{{baseUrl}}/orders' }, auth: { type: 'bearer' }, body: { mode: 'raw', raw: '{"sku":"A-100"}' } }, event: [{}], response: [{}] }] }, { name: 'Health', request: { method: 'GET', url: '{{baseUrl}}/health', auth: { type: 'noauth' } } }]
};
const sampleTarget = { v: 8, name: 'Acme imported', variables: [{ key: 'baseUrl', value: '' }], folders: [{ name: 'Orders', folders: [], requests: [{ name: 'Create order', method: 'PUT', endpoint: '{{baseUrl}}/orders', auth: { authType: 'none' }, body: { contentType: 'none', body: '' }, testScript: '', responses: [] }] }], requests: [] };

let sourceData: unknown = null;
let targetData: unknown = null;
const sourceInput = byId<HTMLInputElement>('source-file');
const targetInput = byId<HTMLInputElement>('target-file');
const output = byId<HTMLElement>('report-output');
const verdict = byId<HTMLElement>('report-verdict');

sourceInput.addEventListener('change', () => selectFile(sourceInput, true));
targetInput.addEventListener('change', () => selectFile(targetInput, false));
byId('load-sample').addEventListener('click', () => {
  sourceData = sampleSource; targetData = sampleTarget;
  byId('source-name').textContent = 'sample-team.postman_collection.json';
  byId('target-name').textContent = 'sample-imported.hoppscotch.json';
  runInspection();
});
byId('run-demo').addEventListener('click', runInspection);
byId('clear-demo').addEventListener('click', clearDemo);

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  const text = button.dataset.copy ?? '';
  try {
    await navigator.clipboard.writeText(text);
    const old = button.textContent; button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = old; }, 1500);
  } catch { button.textContent = 'Select & copy'; }
}));

byId('replay-trace').addEventListener('click', async event => {
  const button = event.currentTarget as HTMLButtonElement;
  const lines = [...document.querySelectorAll<HTMLElement>('[data-trace]')];
  lines.forEach(line => { line.hidden = true; });
  button.disabled = true; button.textContent = 'Playing…';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const line of lines) { if (!reduced) await wait(650); line.hidden = false; }
  button.disabled = false; button.textContent = 'Replay recorded run';
});

function byId<T extends HTMLElement = HTMLElement>(id: string): T { return document.getElementById(id) as T; }
async function selectFile(input: HTMLInputElement, source: boolean) {
  const file = input.files?.[0]; if (!file) return;
  byId(source ? 'source-name' : 'target-name').textContent = file.name;
  if (file.size > 10 * 1024 * 1024) { showError(`${file.name} is over the 10 MB browser preview limit. Use the CLI for large exports.`); return; }
  try {
    const parsed = JSON.parse(await file.text());
    if (source) sourceData = parsed; else targetData = parsed;
  } catch { showError(`${file.name} is not valid JSON. Export the collection again and retry.`); }
}

async function runInspection() {
  if (!sourceData || !targetData) { showError('Choose both a Postman source and Hoppscotch target, or load the sample.'); return; }
  output.setAttribute('aria-busy', 'true'); output.className = 'empty-report';
  output.innerHTML = '<span class="empty-mark" aria-hidden="true">⌁</span><p><strong>Measuring structure…</strong><br>Reading names, scopes, and field shapes locally.</p>';
  verdict.className = 'verdict loading'; verdict.textContent = 'Inspecting';
  await wait(220);
  try {
    const report = inspect(sourceData as Record<string, unknown>, targetData as Record<string, unknown>);
    renderReport(report.findings, report.counts);
  } catch (error) { showError(error instanceof Error ? error.message : 'These exports could not be inspected.'); }
}

function inspect(source: Record<string, unknown>, target: Record<string, unknown>) {
  const schema = (source.info as { schema?: string } | undefined)?.schema ?? '';
  if (!schema.includes('v2.1')) throw new Error('Source is not a Postman Collection v2.1 export. Check the export version and retry.');
  if (!Array.isArray(target.folders) && !Array.isArray(target.requests)) throw new Error('Target does not look like a Hoppscotch collection export. The CLI also accepts Bruno.');
  const src = new Map<string, { method: string; url: string; auth: string; body: string; bytes: number; scripts: number; examples: number }>();
  const folders = new Set<string>();
  walkSource((source.item ?? []) as Item[], '', src, folders);
  const dst = new Map<string, { method: string; url: string; auth: string; body: string; bytes: number; scripts: number; examples: number }>();
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

function walkSource(items: Item[], parent: string, result: Map<string, any>, folders: Set<string>) {
  items.forEach(item => {
    const path = join(parent, item.name ?? 'unnamed');
    if (item.item) { folders.add(path); walkSource(item.item, path, result, folders); return; }
    if (!item.request) return;
    const url = typeof item.request.url === 'string' ? item.request.url : item.request.url?.raw ?? '';
    result.set(path, { method: (item.request.method ?? 'GET').toUpperCase(), url, auth: item.request.auth?.type ?? 'none', body: item.request.body?.mode ?? 'none', bytes: item.request.body?.raw?.length ?? 0, scripts: item.event?.length ?? 0, examples: item.response?.length ?? 0 });
  });
}
function walkTarget(node: { requests?: HopRequest[]; folders?: HopFolder[] }, parent: string, result: Map<string, any>, folders: Set<string>) {
  (node.requests ?? []).forEach(request => {
    const path = join(parent, request.name ?? 'unnamed');
    result.set(path, { method: (request.method ?? 'GET').toUpperCase(), url: request.endpoint ?? '', auth: request.auth?.authType ?? 'none', body: request.body?.contentType ?? 'none', bytes: request.body?.body?.length ?? 0, scripts: Number(Boolean(request.testScript)) + Number(Boolean(request.preRequestScript)), examples: request.responses?.length ?? 0 });
  });
  (node.folders ?? []).forEach(folder => { const path = join(parent, folder.name ?? 'unnamed'); folders.add(path); walkTarget(folder, path, result, folders); });
}
function renderReport(findings: Finding[], counts: { source: number; target: number; folders: number; variables: number }) {
  output.setAttribute('aria-busy', 'false'); output.className = 'report-results';
  const shown = findings.slice(0, 5);
  output.innerHTML = `<div class="report-summary"><div><strong>${counts.source}</strong><span>source requests</span></div><div><strong>${counts.target}</strong><span>target requests</span></div><div><strong>${findings.length}</strong><span>critical changes</span></div></div>${findings.length ? `<ul class="findings">${shown.map(f => `<li><span class="finding-icon" aria-hidden="true">!</span><strong>${escapeHtml(f.code)} · ${escapeHtml(f.path)}</strong><small>${escapeHtml(f.note)}</small></li>`).join('')}</ul>${findings.length > shown.length ? `<p class="privacy-note">+ ${findings.length - shown.length} more in the full CLI report</p>` : ''}` : '<div class="empty-report"><span class="empty-mark" aria-hidden="true">✓</span><p><strong>No structural differences found.</strong><br>Continue with client-specific smoke tests.</p></div>'}`;
  verdict.className = `verdict ${findings.length ? 'bad' : 'good'}`; verdict.textContent = findings.length ? 'Changes detected' : 'Structurally verified';
}
function showError(message: string) { output.setAttribute('aria-busy', 'false'); output.className = 'empty-report'; output.innerHTML = `<span class="empty-mark" aria-hidden="true">!</span><p><strong>Inspection stopped.</strong><br>${escapeHtml(message)}</p>`; verdict.className = 'verdict bad'; verdict.textContent = 'Input error'; }
function clearDemo() { sourceData = null; targetData = null; sourceInput.value = ''; targetInput.value = ''; byId('source-name').textContent = 'No source selected'; byId('target-name').textContent = 'No target selected'; output.className = 'empty-report'; output.innerHTML = '<span class="empty-mark" aria-hidden="true">⌗</span><p><strong>No measurement yet.</strong><br>Load the sample or choose two exports to begin.</p>'; verdict.className = 'verdict neutral'; verdict.textContent = 'Awaiting input'; }
function join(parent: string, name: string) { return parent ? `${parent}/${name.replaceAll('/', '∕')}` : name.replaceAll('/', '∕'); }
function normalizeAuth(value: string) { return value === 'noauth' ? 'none' : value.toLowerCase(); }
function bodyKind(value: string) { return ['raw', 'json', 'application/json'].includes(value.toLowerCase()) ? 'text/json' : value.toLowerCase(); }
function escapeHtml(value: string) { const span = document.createElement('span'); span.textContent = value; return span.innerHTML; }
function wait(ms: number) { return new Promise(resolve => window.setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms)); }

function updateNetwork() { const state = byId('network-state'); state.textContent = navigator.onLine ? 'Online · local processing' : 'Offline · demo still works'; state.classList.toggle('offline', !navigator.onLine); }
addEventListener('online', updateNetwork); addEventListener('offline', updateNetwork); updateNetwork();
if (import.meta.env.PROD && 'serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
