// B"H
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../geelooy/API/social/helper/apiKeys.js');
const repoRoot = process.cwd();
const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/packed-snapshot-http-probe');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function kill8080() {
  try {
    const out = execSync("netstat -ano | findstr :8080", { encoding: 'utf8' });
    for (const line of out.split(/\r?\n/)) {
      const pid = line.trim().split(/\s+/).pop();
      if (/^\d+$/.test(pid) && pid !== '0') {
        try { process.kill(Number(pid), 'SIGTERM'); } catch {}
      }
    }
  } catch {}
}
async function req(route, { apiKey, timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`TIMEOUT ${route}`)), timeoutMs);
  try {
    const url = `http://127.0.0.1:8080${route}${apiKey ? `${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : ''}`;
    const res = await fetch(url, { signal: controller.signal, headers: apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {} });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return { status: res.status, json, text };
  } finally { clearTimeout(timer); }
}
async function waitReady(server) {
  for (let i = 0; i < 40; i++) {
    if (server.exitCode !== null) throw new Error(`server exited ${server.exitCode}`);
    try { const r = await req('/api/social/keys/verify?apiKey=probe'); if (r.status === 200 || r.status === 404) return; } catch {}
    await wait(250);
  }
  throw new Error('not ready');
}
async function main() {
  kill8080();
  await wait(800);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const db = new DosDB(dbRoot); await db.init();
  const userId = `snapshotProbe_${Date.now().toString(36)}`;
  const made = await createApiKey({ $i: { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'snapshot probe' } }, userid: userId });
  const apiKey = made.success.key;
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')], env: { ...process.env, AWTSMOOS_REAL_SMOKE_DEBUG: '1' } });
  try {
    await waitReady(server);
    console.log('serverPid', server.pid);
    const stats = await req('/api/social/packed/stats', { apiKey });
    console.log('stats', stats.status, stats.json.success?.length, stats.json.success?.find?.(x => x.shard === 'core')?.approximate);
    const snap = await req('/api/social/packed/snapshot', { apiKey });
    console.log('snapshot', snap.status, snap.json.success?.manifests, snap.json.success?.indexStats?.records);
    console.log('B"H packed_snapshot_http_probe passed');
  } finally {
    server.kill('SIGTERM');
    await wait(300);
    console.log('server.log tail', fs.existsSync(path.join(tmpDir, 'server.log')) ? fs.readFileSync(path.join(tmpDir, 'server.log'), 'utf8').slice(-1000) : '');
    console.log('server.err tail', fs.existsSync(path.join(tmpDir, 'server.err')) ? fs.readFileSync(path.join(tmpDir, 'server.err'), 'utf8').slice(-1000) : '');
  }
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
