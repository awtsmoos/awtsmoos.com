// B"H
const assert = require('assert');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

/**
 * B"H
 * Chapter 417: Many files rose like sparks, and the installed sandbox agent
 * walked their pages without swallowing the universe in one bite.
 */
const repoRoot = process.cwd();
const home = path.join(repoRoot, 'AI_THOUGHTS/runtime-stress/.tmp-windows-localhost-install/home');
const installRoot = path.join(home, '.awtsmoos-tunnel');
const entry = path.join(installRoot, 'main.js');
const apiPort = 3988;
const stressDir = path.join(repoRoot, 'AI_THOUGHTS/runtime-stress/.tmp-pagination-tree');

async function makeStressFiles() {
  fs.rmSync(stressDir, { recursive: true, force: true });
  await fsp.mkdir(path.join(stressDir, 'src/a/b/c'), { recursive: true });
  const writes = [];
  for (let i = 0; i < 240; i++) {
    const dir = i % 4 === 0 ? 'src/a' : i % 4 === 1 ? 'src/a/b' : i % 4 === 2 ? 'src/a/b/c' : 'src';
    const file = path.join(stressDir, dir, `file-${String(i).padStart(3,'0')}.js`);
    const importLine = i > 0 && i < 80 ? `import './file-${String(i - 1).padStart(3,'0')}.js';\n` : '';
    writes.push(fsp.writeFile(file, `// B"H stress ${i}\n${importLine}export const value${i} = 'AWTS_STRESS_${i % 17}';\n`, 'utf8'));
  }
  await Promise.all(writes);
  await fsp.writeFile(path.join(stressDir, 'src', 'entry.js'), "import './file-003.js';\nimport './a/file-004.js';\nconsole.log('entry');\n", 'utf8');
}
async function fetchJson(url, options = {}) {
  const r = await fetch(url, options);
  const text = await r.text();
  if (!r.ok) throw new Error(`${url} ${r.status}: ${text.slice(0,500)}`);
  return JSON.parse(text);
}
function tool(action, args = {}) {
  return fetchJson(`http://127.0.0.1:${apiPort}/tool`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, arguments: args }) });
}
function startAgent() {
  const child = spawn(process.execPath, [entry], { cwd: repoRoot, env: { ...process.env, USERPROFILE: home, AWTSMOOS_LOCAL_API: '1', AWTSMOOS_LOCAL_API_PORT: String(apiPort) }, stdio: ['ignore','pipe','pipe'] });
  let out = '', err = '';
  child.stdout.on('data', c => out += c);
  child.stderr.on('data', c => err += c);
  child.logs = () => ({ out, err });
  return child;
}
async function waitHealth(child) {
  const start = Date.now(); let last;
  while (Date.now() - start < 40000) {
    if (child.exitCode !== null) throw new Error('agent exited ' + child.exitCode + JSON.stringify(child.logs()));
    try { return await fetchJson(`http://127.0.0.1:${apiPort}/health`); } catch (e) { last = e; await new Promise(r => setTimeout(r, 500)); }
  }
  throw last || new Error('health timeout');
}
async function pageThrough(first, nextKey, limit = 20) {
  const pages = [first];
  let current = first;
  for (let i = 0; i < limit && (current.nextPagePayload || current.nextRequest || current.nextScanRequest); i++) {
    const payload = current.nextPagePayload || current.nextRequest || current.nextScanRequest;
    const action = payload.action || first.action;
    current = await tool(action, payload);
    pages.push(current);
  }
  return pages;
}
(async () => {
  assert.ok(fs.existsSync(entry), 'installed sandbox missing');
  await makeStressFiles();
  const child = startAgent();
  try {
    await waitHealth(child);
    const rel = 'AI_THOUGHTS/runtime-stress/.tmp-pagination-tree';
    const tree1 = await tool('tree', { p: rel, depth: 5, pageSize: 25, cursor: 0 });
    assert.equal(tree1.ok, true); assert.equal(tree1.partial, true);
    const treePages = await pageThrough(tree1, 'nextPagePayload', 20);
    const treeRows = treePages.reduce((n, p) => n + (p.returnedRows || p.rows?.length || 0), 0);
    assert.ok(treePages.length > 2, 'expected multiple tree pages');
    const search1 = await tool('search', { path: rel, query: 'AWTS_STRESS_', pageSize: 30, maxResults: 30, maxFiles: 40 });
    assert.equal(search1.ok, true); assert.ok(search1.hasNextPage || search1.hasNextScan || search1.partial);
    const searchPages = await pageThrough(search1, 'nextRequest', 20);
    const searchReturned = searchPages.reduce((n, p) => n + (p.returnedResults || p.results?.length || 0), 0);
    assert.ok(searchReturned >= 30, 'expected many search results');
    const paths = Array.from({ length: 60 }, (_, i) => `${rel}/src/file-${String(i).padStart(3,'0')}.js`).join('\n');
    const bulk1 = await tool('bulk', { paths, pageSize: 10, maxFiles: 10, maxChars: 500, totalMaxChars: 5000 });
    assert.equal(bulk1.ok, true); assert.equal(bulk1.partial, true);
    const bulkPages = await pageThrough(bulk1, 'nextPagePayload', 20);
    const bulkCount = bulkPages.reduce((n, p) => n + (p.returnedCount || 0), 0);
    assert.ok(bulkCount >= 40, 'expected bulk pagination count');
    const conn = await tool('connectedFiles', { path: `${rel}/src/entry.js`, maxDepth: 3, pageSize: 2, maxFiles: 20, maxBytes: 8000 });
    assert.equal(conn.ok, true); assert.ok(conn.returnedCount >= 1);
    const autoRuntime = await tool('simulateRuntime', { engine: 'auto', html: '<body><div id="ok">AUTO</div></body>', returnValues: JSON.stringify(['document.querySelector("#ok").textContent']), timeoutMs: 60000 });
    assert.equal(autoRuntime.ok, true, JSON.stringify(autoRuntime));
    console.log(JSON.stringify({ ok: true, tree: { pages: treePages.length, rows: treeRows }, search: { pages: searchPages.length, returned: searchReturned }, bulk: { pages: bulkPages.length, returned: bulkCount }, connectedFiles: { count: conn.count, returnedCount: conn.returnedCount, partial: conn.partial }, runtime: { engine: autoRuntime.engine, autoRuntime: autoRuntime.autoRuntime, attemptedEngines: autoRuntime.attemptedEngines } }, null, 2));
  } finally {
    child.kill();
  }
})().catch(e => { console.error(JSON.stringify({ ok: false, error: e.message, stack: e.stack }, null, 2)); process.exit(1); });
