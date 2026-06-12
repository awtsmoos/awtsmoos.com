// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = process.cwd();
const home = path.join(repoRoot, 'AI_THOUGHTS/runtime-stress/.tmp-windows-localhost-install/home');
const installRoot = path.join(home, '.awtsmoos-tunnel');
const entry = path.join(installRoot, 'main.js');
const apiPort = 3988;

async function fetchJson(url, options = {}) {
  const r = await fetch(url, options);
  const text = await r.text();
  if (!r.ok) throw new Error(`${url} ${r.status}: ${text.slice(0, 500)}`);
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
async function expectOk(name, promise, allowFalse = false) {
  const result = await promise;
  if (!allowFalse) assert.equal(result.ok, true, `${name} failed ${JSON.stringify(result).slice(0,1000)}`);
  return { name, ok: result.ok, action: result.action, keys: Object.keys(result).slice(0, 20), sample: summarize(result) };
}
function summarize(x) {
  const out = {};
  for (const k of ['count','returnedCount','okCount','totalMatches','partial','engine','autoRuntime','action','connected','virtual','error']) if (k in x) out[k] = x[k];
  return out;
}
(async () => {
  assert.ok(fs.existsSync(entry), 'sandbox install missing; run windows localhost install test first');
  const child = startAgent();
  try {
    const health = await waitHealth(child);
    const results = [];
    results.push(await expectOk('list', tool('list', { p: '.', maxResults: 20 })));
    results.push(await expectOk('tree', tool('tree', { p: 'geelooy/apps/tunnel/agent/tools', depth: 2, limit: 50 })));
    results.push(await expectOk('read', tool('read', { path: 'geelooy/apps/tunnel/agent/manifest.txt', maxChars: 100 })));
    results.push(await expectOk('bulk', tool('bulk', { paths: 'geelooy/apps/tunnel/agent/main.js\ngeelooy/apps/tunnel/agent/tools/fs/actions.js', maxFiles: 2, maxChars: 1000 })));
    results.push(await expectOk('search', tool('search', { path: 'geelooy/apps/tunnel/agent/tools', query: 'B"H', maxResults: 10, pageSize: 5 })));
    results.push(await expectOk('connectedFiles', tool('connectedFiles', { path: 'geelooy/apps/tunnel/agent/tools/fs/actions.js', maxDepth: 1, maxFiles: 20, maxBytes: 50000 })));
    results.push(await expectOk('simulateRuntime-node-dom', tool('simulateRuntime', { engine: 'node-dom', html: '<body><button id="b">B</button></body>', returnValues: JSON.stringify(['document.querySelector("#b").textContent']) })));
    results.push(await expectOk('chromeEval-node-dom', tool('chromeEval', { engine: 'node-dom', html: '<body><h1>Node DOM</h1></body>', expression: 'document.querySelector("h1").textContent' })));
    results.push(await expectOk('chromeRunScript-node-dom', tool('chromeRunScript', { engine: 'node-dom', html: '<body><div id="x"></div></body>', actionsJson: JSON.stringify([{type:'eval', expression:'x.textContent="OK"'}]), returnValues: JSON.stringify(['x.textContent']) })));
    results.push(await expectOk('httpJson', tool('httpJson', { url: `http://127.0.0.1:${apiPort}/health`, timeoutMs: 5000 })));
    results.push(await expectOk('command-disabled', tool('command', { command: 'echo SHOULD_NOT_RUN', allowCommands: false }), true));
    results.push(await expectOk('command-enabled', tool('command', { command: 'node -e "console.log(123)"', allowCommands: true, timeoutMs: 30000 })));
    console.log(JSON.stringify({ ok: true, health: { tunnelName: health.tunnelName, agentVersion: health.agentVersion }, results }, null, 2));
  } finally {
    child.kill();
  }
})().catch(e => { console.error(JSON.stringify({ ok: false, error: e.message, stack: e.stack }, null, 2)); process.exit(1); });
