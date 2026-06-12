//B"H
/**
 * @module translationHttpServer
 * @description Starts local API and creates the translation alias/key vessel.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { OUT_DIR, ROOT, TRANSLATION_ALIAS, TRANSLATION_USER } from './config.mjs';

const require = createRequire(import.meta.url);
const { createApiKey, verifyApiKey } = require(path.join(ROOT, 'geelooy/API/social/helper/apiKeys.js'));

export async function request(route, { method = 'GET', body, apiKey, timeoutMs = 30000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error(`TIMEOUT ${method} ${route}`)), timeoutMs);
  try {
    const withKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
    const finalBody = apiKey && body ? { apiKey, ...body } : body;
    const res = await fetch(`http://127.0.0.1:8080${withKey}`, {
      method,
      headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
      body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
      signal: controller.signal
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
    return { status: res.status, json, text };
  } finally { clearTimeout(timer); }
}

export async function seedApiKey(db) {
  const $i = { db, request: { user: { info: { userId: TRANSLATION_USER } }, headers: {} }, $_POST: { label: 'tanach translation comments' } };
  const created = await createApiKey({ $i, userid: TRANSLATION_USER });
  assert.ok(created.success?.key, 'translation API key should be created');
  const verified = await verifyApiKey({ $i: { db, request: { headers: {} }, $_GET: { apiKey: created.success.key }, $_POST: {}, $_DELETE: {} } });
  assert.equal(verified.success?.userId, TRANSLATION_USER);
  return created.success.key;
}

export async function startServer() {
  const out = fs.openSync(path.join(OUT_DIR, 'parallel_tanach_server.out.log'), 'a');
  const err = fs.openSync(path.join(OUT_DIR, 'parallel_tanach_server.err.log'), 'a');
  const server = spawn('node', ['index'], { cwd: ROOT, stdio: ['ignore', out, err], env: { ...process.env, AWTSMOOS_TANACH_TRANSLATION: '1' } });
  for (let i = 0; i < 50; i++) {
    if (server.exitCode !== null) throw new Error(`Server exited early: ${server.exitCode}`);
    try { if ((await request('/api/social/keys/verify?apiKey=probe', { timeoutMs: 2000 })).status) return server; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Server did not become ready');
}

export async function stopServer(server) {
  if (server?.exitCode === null) server.kill('SIGTERM');
  await new Promise(resolve => setTimeout(resolve, 250));
}

export async function ensureAlias(apiKey) {
  const res = await request('/api/social/aliases', { method: 'POST', apiKey, body: { aliasName: 'Torah Translation English', inputId: TRANSLATION_ALIAS, description: 'English Tanach translation comments refined by Minimax.' } });
  if (res.status !== 200) throw new Error(`Alias ensure HTTP failed: ${res.text}`);
  if (res.json?.error && !/exist|already/i.test(JSON.stringify(res.json))) throw new Error(`Alias ensure failed: ${res.text}`);
}
