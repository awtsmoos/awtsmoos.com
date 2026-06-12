// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../geelooy/API/social/helper/apiKeys.js');
const repoRoot = process.cwd();
const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/thread-route-probe');
const suffix = Date.now().toString(36);
const apiUser = `threadUser_${suffix}`;
const apiAlias = `threadAlias_${suffix}`;
const postId = `threadPost_${suffix}`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function req(route, { method = 'GET', body, apiKey } = {}) {
  const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalBody = apiKey && body ? { apiKey, ...body } : body;
  const response = await fetch(`http://127.0.0.1:8080${routeWithKey}`, { method, headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, body: finalBody ? new URLSearchParams(finalBody).toString() : undefined });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, json, text };
}
async function waitForServer(server) {
  for (let i = 0; i < 40; i++) {
    if (server.exitCode !== null) throw new Error(`server exited ${server.exitCode}`);
    try { const r = await req('/api/social/keys/verify?apiKey=probe'); if (r.status === 200 || r.status === 404) return; } catch {}
    await wait(250);
  }
  throw new Error('server not ready');
}
async function main() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const db = new DosDB(dbRoot);
  await db.init();
  const made = await createApiKey({ $i: { db, request: { user: { info: { userId: apiUser } }, headers: {} }, $_POST: { label: 'thread probe' } }, userid: apiUser });
  const apiKey = made.success.key;
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')], env: { ...process.env, AWTSMOOS_SKIP_COMMENT_VECTORS: '1' } });
  try {
    await waitForServer(server);
    const root = await req('/api/social/comments/thread/append', { method: 'POST', apiKey, body: { postId, commentId: `${suffix}_root`, aliasId: apiAlias, content: 'root route content' } });
    assert.equal(root.status, 200, root.text);
    assert.equal(root.json.success.packedAuditWritten, false, root.text);
    const reply = await req('/api/social/comments/thread/append', { method: 'POST', apiKey, body: { postId, commentId: `${suffix}_reply`, parentId: `${suffix}_root`, aliasId: apiAlias, content: 'reply route content' } });
    assert.equal(reply.status, 200, reply.text);
    const ranked = await req(`/api/social/comments/thread/${encodeURIComponent(postId)}/ranked`, { apiKey });
    assert.equal(ranked.status, 200, ranked.text);
    assert.equal(ranked.json.success.packedAuditRead, false, ranked.text);
    assert.equal(ranked.json.success.comments[0].commentId, `${suffix}_root`, ranked.text);
    console.log('B"H thread_route_probe passed', JSON.stringify({ postId, top: ranked.json.success.comments[0].commentId }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(250);
  }
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
