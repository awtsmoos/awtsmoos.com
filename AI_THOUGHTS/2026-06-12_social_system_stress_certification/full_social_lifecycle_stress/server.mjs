//B"H
/**
 * @module FullSocialLifecycleServer
 * @description
 * The Awtsmoos opens the local server, plants real API keys in DosDB, and
 * watches every HTTP breath return as evidence rather than assumption.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../ayzarim/DosDB/index.js');
const { createApiKey, verifyApiKey } = require('../../../geelooy/API/social/helper/apiKeys.js');

export const repoRoot = process.cwd();
export const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
export const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/full-social-lifecycle-stress');

export function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

export async function request(route, { method = 'GET', body, apiKey, timeoutMs = 15000 } = {}) {
  const withKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalBody = apiKey && body ? { apiKey, ...body } : body;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`TIMEOUT ${method} ${route}`)), timeoutMs);
  console.log(`B"H REQUEST ${method} ${route}`);
  try {
    const response = await fetch(`http://127.0.0.1:8080${withKey}`, {
      method,
      headers: {
        ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}),
        ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
      },
      body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
      signal: controller.signal
    });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    console.log(`B"H RESPONSE ${method} ${route} ${response.status}`);
    return { status: response.status, json, text };
  } finally {
    clearTimeout(timer);
  }
}

export async function seedApiKey(userId) {
  const db = new DosDB(dbRoot);
  await db.init();
  const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'full lifecycle stress' } };
  const created = await createApiKey({ $i, userid: userId });
  assert.ok(created.success?.key, `API key should be created for ${userId}`);
  const direct = await verifyApiKey({ $i: { db, request: { headers: {} }, $_GET: { apiKey: created.success.key }, $_POST: {}, $_DELETE: {} } });
  assert.equal(direct.success?.userId, userId, `direct key verify failed for ${userId}`);
  return created.success.key;
}

export async function startServer() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const out = fs.openSync(path.join(tmpDir, 'server.log'), 'w');
  const err = fs.openSync(path.join(tmpDir, 'server.err'), 'w');
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: ['ignore', out, err], env: { ...process.env, AWTSMOOS_FULL_SOCIAL_STRESS: '1' } });
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited before readiness: ${server.exitCode}`);
    try {
      const probe = await request('/api/social/keys/verify?apiKey=probe', { timeoutMs: 3000 });
      if (probe.status === 200 || probe.status === 404) return server;
    } catch {}
    await wait(250);
  }
  throw new Error('Server did not become ready on 127.0.0.1:8080');
}

export async function stopServer(server) {
  if (server?.exitCode === null) server.kill('SIGTERM');
  await wait(250);
}
