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

async function fetchText(url, options) {
  const r = await fetch(url, options);
  const text = await r.text();
  if (!r.ok) throw new Error(`${url} ${r.status}: ${text.slice(0, 500)}`);
  return text;
}
async function fetchJson(url, options) { return JSON.parse(await fetchText(url, options)); }
async function waitHealth(child) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < 30000) {
    if (child.exitCode !== null) throw new Error('agent exited early ' + child.exitCode + '\n' + child.logs());
    try { return await fetchJson(`http://127.0.0.1:${apiPort}/health`); }
    catch (e) { last = e; await new Promise(r => setTimeout(r, 500)); }
  }
  throw new Error('health timeout: ' + (last && last.message) + '\n' + child.logs());
}
function start() {
  assert.ok(fs.existsSync(entry), 'missing installed main.js');
  const child = spawn(process.execPath, [entry], {
    cwd: repoRoot,
    env: { ...process.env, USERPROFILE: home, AWTSMOOS_LOCAL_API: '1', AWTSMOOS_LOCAL_API_PORT: String(apiPort), AWTSMOOS_SKIP_OPEN_CONTROL: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let out = '', err = '';
  child.stdout.on('data', c => out += c);
  child.stderr.on('data', c => err += c);
  child.logs = () => `STDOUT:\n${out}\nSTDERR:\n${err}`;
  return child;
}
(async () => {
  const child = start();
  try {
    const health = await waitHealth(child);
    const list = await fetchJson(`http://127.0.0.1:${apiPort}/tool`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'list', arguments: { p: '.' } }) });
    const read = await fetchJson(`http://127.0.0.1:${apiPort}/tool`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'read', arguments: { path: 'geelooy/apps/tunnel/agent/manifest.txt', maxChars: 80 } }) });
    console.log(JSON.stringify({ ok: true, health: { tunnelName: health.tunnelName, agentVersion: health.agentVersion, root: health.root }, listOk: list.ok, listItems: list.items && list.items.length, readOk: read.ok, readContent: read.content }, null, 2));
  } finally {
    child.kill();
    setTimeout(() => process.exit(0), 500).unref();
  }
})().catch(e => { console.error(JSON.stringify({ ok: false, error: e.message, stack: e.stack }, null, 2)); process.exit(1); });
