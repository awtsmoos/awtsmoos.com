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
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/platform-tail-probe');
const suffix = Date.now().toString(36);
const runId = `BH_TAIL_${suffix}`;
const heichelId = `tailHeichel_${suffix}`;
const aliasId = `tailAlias_${suffix}`;
const aliasIdB = `tailAliasB_${suffix}`;
const userId = `tailUser_${suffix}`;
const userIdB = `tailUserB_${suffix}`;
const questionId = `tailQuestion_${suffix}`;
const answerId = `tailAnswer_${suffix}`;
const seriesId = 'root';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function request(route, { method = 'GET', body, apiKey, timeoutMs = 7000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`TIMEOUT ${method} ${route}`)), timeoutMs);
  try {
    const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
    const finalBody = apiKey && body ? { apiKey, ...body } : body;
    const response = await fetch(`http://127.0.0.1:8080${routeWithKey}`, { method, headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, body: finalBody ? new URLSearchParams(finalBody).toString() : undefined, signal: controller.signal });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    return { status: response.status, json, text };
  } finally { clearTimeout(timer); }
}
async function step(name, fn) {
  const start = Date.now();
  process.stdout.write(`STEP ${name} ... `);
  const res = await fn();
  console.log(`OK ${Date.now() - start}ms`);
  return res;
}
async function waitForServer(server) {
  for (let i = 0; i < 40; i++) {
    if (server.exitCode !== null) throw new Error(`server exited ${server.exitCode}`);
    try { const r = await request('/api/social/keys/verify?apiKey=probe', { timeoutMs: 1200 }); if (r.status === 200 || r.status === 404) return; } catch {}
    await wait(250);
  }
  throw new Error('server not ready');
}
async function seedKey(db, user) {
  const made = await createApiKey({ $i: { db, request: { user: { info: { userId: user } }, headers: {} }, $_POST: { label: 'tail probe' } }, userid: user });
  assert.ok(made.success?.key);
  return made.success.key;
}
async function main() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const db = new DosDB(dbRoot);
  await db.init();
  const apiKey = await seedKey(db, userId);
  const apiKeyB = await seedKey(db, userIdB);
  await db.write(`/social/heichelos/${heichelId}/info`, { name: heichelId, author: aliasId });
  await db.write(`/social/heichelos/${heichelId}/editors`, [aliasId, aliasIdB]);
  await db.write(`/social/heichelos/${heichelId}/public`, { public: true });
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')], env: { ...process.env, AWTSMOOS_SKIP_COMMENT_VECTORS: '1' } });
  try {
    await step('waitForServer', () => waitForServer(server));
    await step('create aliases', async () => {
      assert.equal((await request('/api/social/aliases', { method: 'POST', apiKey, body: { aliasName: aliasId, inputId: aliasId } })).status, 200);
      assert.equal((await request('/api/social/aliases', { method: 'POST', apiKey: apiKeyB, body: { aliasName: aliasIdB, inputId: aliasIdB } })).status, 200);
    });
    await step('create question/answer', async () => {
      assert.equal((await request(`/api/social/content/heichelos/${heichelId}/questions`, { method: 'POST', apiKey, body: { aliasId, postId: questionId, title: 'Tail question', content: 'Tail question body', seriesId } })).status, 200);
      assert.equal((await request(`/api/social/content/heichelos/${heichelId}/questions/${questionId}/answers`, { method: 'POST', apiKey, body: { aliasId, answerId, title: 'Tail answer', content: 'Tail answer body', seriesId } })).status, 200);
    });
    await step('notification for digest', async () => {
      assert.equal((await request(`/api/social/notifications/${aliasIdB}`, { method: 'POST', apiKey, body: { fromAliasId: aliasId, type: 'chat', title: 'Tail note' } })).status, 200);
    });
    await step('media register/attach', async () => {
      assert.equal((await request('/api/social/media/register', { method: 'POST', apiKey, body: { mediaId: `${runId}_media`, aliasId, metadata: JSON.stringify({ mime: 'image/png' }) } })).status, 200);
      assert.equal((await request('/api/social/media/attach', { method: 'POST', apiKey, body: { mediaId: `${runId}_media`, entity: JSON.stringify({ type: 'question', id: questionId }) } })).status, 200);
    });
    await step('moderation/job/metric', async () => {
      assert.equal((await request('/api/social/mod/reports', { method: 'POST', apiKey, body: { actor: aliasIdB, target: JSON.stringify({ type: 'question', id: questionId }), reason: 'tail report' } })).status, 200);
      assert.equal((await request('/api/social/jobs/enqueue', { method: 'POST', apiKey, body: { type: 'compact', payload: JSON.stringify({ shard: 'core' }) } })).status, 200);
      assert.equal((await request('/api/social/analytics/metric', { method: 'POST', apiKey, body: { name: 'tail.metric', value: '1', tags: JSON.stringify({ heichelId }) } })).status, 200);
    });
    await step('cache/sync/permission/federation', async () => {
      assert.equal((await request('/api/social/cache/set', { method: 'POST', apiKey, body: { key: `${runId}:feed`, value: JSON.stringify({ questionId }), ttlMs: '60000' } })).status, 200);
      assert.equal((await request('/api/social/sync/op', { method: 'POST', apiKey, body: { aliasId, op: 'draft.save', payload: JSON.stringify({ questionId }) } })).status, 200);
      assert.equal((await request('/api/social/permissions/compile', { method: 'POST', apiKey, body: { subject: aliasId, resource: heichelId, rules: JSON.stringify({ allow: true }) } })).status, 200);
      assert.equal((await request('/api/social/federation/import', { method: 'POST', apiKey, body: { remoteHeichel: `${heichelId}_remote`, signedPayload: JSON.stringify({ sig: 'demo' }) } })).status, 200);
    });
    await step('graph good/bad', async () => {
      assert.equal((await request('/api/social/graph/transaction', { method: 'POST', apiKey, body: { actor: aliasId, edges: JSON.stringify([{ kind: 'references', from: { type: 'question', id: questionId, heichelId }, to: { type: 'answer', id: answerId, heichelId } }]) } })).status, 200);
      assert.equal((await request('/api/social/graph/transaction', { method: 'POST', apiKey, body: { actor: aliasId, edges: JSON.stringify([{ kind: 'references', from: { type: 'post' }, to: { type: 'answer', id: answerId } }]) } })).status, 200);
    });
    await step('digest/runJobs/cacheGet/cacheInvalidate/syncPull', async () => {
      assert.equal((await request(`/api/social/notifications/digest/${aliasIdB}`, { method: 'POST', apiKey: apiKeyB, body: {} })).status, 200);
      assert.equal((await request('/api/social/jobs/run', { method: 'POST', apiKey, body: { limit: '5' }, timeoutMs: 15000 })).status, 200);
      assert.equal((await request(`/api/social/cache/get?key=${encodeURIComponent(`${runId}:feed`)}`, { apiKey })).status, 200);
      assert.equal((await request('/api/social/cache/invalidate', { method: 'POST', apiKey, body: { key: `${runId}:feed` } })).status, 200);
      assert.equal((await request(`/api/social/sync/pull/${aliasId}?since=0`, { apiKey })).status, 200);
    });
    await step('feeds', async () => {
      assert.equal((await request(`/api/social/feed/home?aliasId=${aliasId}`, { apiKey })).status, 200);
      assert.equal((await request(`/api/social/feed/heichel/${heichelId}`, { apiKey })).status, 200);
      assert.equal((await request('/api/social/feed/trending', { apiKey })).status, 200);
      assert.equal((await request('/api/social/feed/discover', { apiKey })).status, 200);
    });
    await step('thread routes', async () => {
      assert.equal((await request('/api/social/comments/thread/append', { method: 'POST', apiKey, body: { postId: questionId, commentId: `${runId}_thread_root`, aliasId, content: 'Thread root' } })).status, 200);
      assert.equal((await request('/api/social/comments/thread/append', { method: 'POST', apiKey: apiKeyB, body: { postId: questionId, commentId: `${runId}_thread_reply`, parentId: `${runId}_thread_root`, aliasId: aliasIdB, content: 'Thread reply' } })).status, 200);
      const ranked = await request(`/api/social/comments/thread/${questionId}/ranked`, { apiKey });
      assert.equal(ranked.status, 200, ranked.text);
      assert.equal(ranked.json.success.comments[0].commentId, `${runId}_thread_root`, ranked.text);
      assert.equal(ranked.json.success.packedAuditRead, false, ranked.text);
    });
    console.log('B"H platform_tail_probe passed', JSON.stringify({ heichelId, questionId, answerId }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(250);
  }
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
