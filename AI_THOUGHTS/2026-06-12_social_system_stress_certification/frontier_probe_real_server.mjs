// B"H
/**
 * Focused real-server frontier probe.
 * Names each gate before entering it, so a silent hang becomes a route name.
 */
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
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/frontier-probe');
const runSuffix = Date.now().toString(36);
const runId = `BH_FRONTIER_${runSuffix}`;
const userId = `${runId}_USER`;
const aliasId = `frontier_${runSuffix}`;
const heichelId = `frontierHeichel_${runSuffix}`;
const postId = `frontierPost_${runSuffix}`;
const questionId = `frontierQuestion_${runSuffix}`;
const answerId = `frontierAnswer_${runSuffix}`;
const seriesId = 'root';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(route, { method = 'GET', body, apiKey, timeoutMs = 8000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error(`TIMEOUT ${timeoutMs}ms ${method} ${route}`)), timeoutMs);
  try {
    const withApiKeyRoute = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
    const finalBody = apiKey && body ? { apiKey, ...body } : body;
    const response = await fetch(`http://127.0.0.1:8080${withApiKeyRoute}`, {
      method,
      headers: {
        ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}),
        ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
      },
      body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
      redirect: 'follow',
      signal: controller.signal
    });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    return { status: response.status, json, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function step(name, fn) {
  const start = Date.now();
  process.stdout.write(`STEP ${name} ... `);
  try {
    const result = await fn();
    console.log(`OK ${Date.now() - start}ms`);
    return result;
  } catch (error) {
    console.log(`FAIL ${Date.now() - start}ms`);
    error.message = `${name}: ${error.message}`;
    throw error;
  }
}

async function waitForServer(server) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) throw new Error(`server exited early ${server.exitCode}`);
    try {
      const response = await request('/api/social/keys/verify?apiKey=probe', { timeoutMs: 1500 });
      if (response.status === 200 || response.status === 404) return;
    } catch {}
    await wait(250);
  }
  throw new Error('server did not become ready');
}

async function seed() {
  const db = new DosDB(dbRoot);
  await db.init();
  const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'frontier probe' } };
  const made = await createApiKey({ $i, userid: userId });
  assert.ok(made.success?.key);
  await db.write(`/social/heichelos/${heichelId}/info`, { name: heichelId, author: aliasId });
  await db.write(`/social/heichelos/${heichelId}/editors`, [aliasId]);
  await db.write(`/social/heichelos/${heichelId}/public`, { public: true });
  return made.success.key;
}

async function main() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const apiKey = await seed();
  const server = spawn('node', ['index'], {
    cwd: repoRoot,
    stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')],
    env: { ...process.env, AWTSMOOS_REAL_SMOKE_DEBUG: '1', AWTSMOOS_SKIP_COMMENT_VECTORS: '1' }
  });
  try {
    await step('waitForServer', () => waitForServer(server));
    await step('create alias', async () => {
      const res = await request('/api/social/aliases', { method: 'POST', apiKey, body: { aliasName: runId, inputId: aliasId } });
      assert.equal(res.status, 200, res.text);
    });
    await step('create post', async () => {
      const res = await request(`/api/social/content/heichelos/${heichelId}/posts`, { method: 'POST', apiKey, body: { aliasId, postId, title: 'Probe post', content: 'Probe content', seriesId } });
      assert.equal(res.status, 200, res.text);
    });
    await step('create question', async () => {
      const sections = JSON.stringify([{ id: 'section1', title: 'Section 1', content: 'Section body' }]);
      const res = await request(`/api/social/content/heichelos/${heichelId}/questions`, { method: 'POST', apiKey, body: { aliasId, postId: questionId, title: 'Probe question', content: 'Question body', seriesId, sections } });
      assert.equal(res.status, 200, res.text);
    });
    await step('create answer', async () => {
      const res = await request(`/api/social/content/heichelos/${heichelId}/questions/${questionId}/answers`, { method: 'POST', apiKey, body: { aliasId, answerId, title: 'Probe answer', content: 'Answer body', seriesId } });
      assert.equal(res.status, 200, res.text);
    });
    await step('packed migration dryRun', async () => {
      const res = await request(`/api/social/packed/migrations/posts/v2/dryRun?heichelId=${heichelId}&seriesId=${seriesId}`, { apiKey, timeoutMs: 12000 });
      assert.equal(res.status, 200, res.text);
    });
    await step('packed migration run', async () => {
      const res = await request(`/api/social/packed/migrations/posts/v2/run?heichelId=${heichelId}&seriesId=${seriesId}`, { method: 'POST', apiKey, body: { heichelId, seriesId, limit: '20' }, timeoutMs: 15000 });
      assert.equal(res.status, 200, res.text);
    });
    await step('packed stats', async () => {
      const res = await request('/api/social/packed/stats', { apiKey, timeoutMs: 12000 });
      assert.equal(res.status, 200, res.text);
      assert.ok(Array.isArray(res.json?.success), res.text);
    });
    await step('packed snapshot', async () => {
      const res = await request('/api/social/packed/snapshot', { apiKey, timeoutMs: 15000 });
      assert.equal(res.status, 200, res.text);
    });
    await step('packed integrity', async () => {
      const res = await request('/api/social/packed/integrity', { apiKey, timeoutMs: 15000 });
      assert.equal(res.status, 200, res.text);
    });
    await step('packed repair manifests', async () => {
      const res = await request('/api/social/packed/repair/posts/manifests?limit=25', { method: 'POST', apiKey, body: { limit: '25' }, timeoutMs: 15000 });
      assert.equal(res.status, 200, res.text);
    });
    await step('packed feed materialize', async () => {
      const res = await request('/api/social/packed/feed/materialize', { method: 'POST', apiKey, body: { heichelId, aliasId, limit: '50' }, timeoutMs: 15000 });
      assert.equal(res.status, 200, res.text);
    });
    await step('packed compact core', async () => {
      const res = await request('/api/social/packed/compact', { method: 'POST', apiKey, body: { shard: 'core' }, timeoutMs: 20000 });
      assert.equal(res.status, 200, res.text);
    });
    await step('cache set/get/invalidate', async () => {
      const key = `${runId}:feed`;
      assert.equal((await request('/api/social/cache/set', { method: 'POST', apiKey, body: { key, value: '{}', ttlMs: '60000' } })).status, 200);
      assert.equal((await request(`/api/social/cache/get?key=${encodeURIComponent(key)}`, { apiKey })).status, 200);
      assert.equal((await request('/api/social/cache/invalidate', { method: 'POST', apiKey, body: { key } })).status, 200);
    });
    await step('sync op/pull', async () => {
      assert.equal((await request('/api/social/sync/op', { method: 'POST', apiKey, body: { aliasId, op: 'draft.save', payload: '{}' } })).status, 200);
      assert.equal((await request(`/api/social/sync/pull/${aliasId}?since=0`, { apiKey })).status, 200);
    });
    await step('permissions compile', async () => {
      const res = await request('/api/social/permissions/compile', { method: 'POST', apiKey, body: { subject: aliasId, resource: heichelId, rules: JSON.stringify({ allow: true }) } });
      assert.equal(res.status, 200, res.text);
    });
    await step('federation import', async () => {
      const res = await request('/api/social/federation/import', { method: 'POST', apiKey, body: { remoteHeichel: `${heichelId}_remote`, signedPayload: JSON.stringify({ sig: 'demo' }) } });
      assert.equal(res.status, 200, res.text);
    });
    await step('graph transaction good/bad', async () => {
      const good = await request('/api/social/graph/transaction', { method: 'POST', apiKey, body: { actor: aliasId, edges: JSON.stringify([{ kind: 'references', from: { type: 'question', id: questionId, heichelId }, to: { type: 'answer', id: answerId, heichelId } }]) } });
      assert.equal(good.status, 200, good.text);
      const bad = await request('/api/social/graph/transaction', { method: 'POST', apiKey, body: { actor: aliasId, edges: JSON.stringify([{ kind: 'references', from: { type: 'post' }, to: { type: 'answer', id: answerId } }]) } });
      assert.equal(bad.status, 200, bad.text);
    });
    console.log('B"H frontier_probe_real_server passed', JSON.stringify({ heichelId, aliasId, questionId, answerId }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(300);
  }
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
