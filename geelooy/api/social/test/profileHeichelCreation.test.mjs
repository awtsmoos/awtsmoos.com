// B"H
/**
 * Chapter 9: a profile forges its own public Heichel through the real server.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../helper/apiKeys.js');
const repoRoot = process.cwd();
const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/profile-heichel-creation');
const suffix = Date.now().toString(36);
const userId = `BH_PROFILE_HEICHEL_${suffix}`;
const aliasId = `profileforge_${suffix}`.slice(0, 32);
const heichelId = `profile_heichel_${suffix}`.slice(0, 40);

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function request(route, { method = 'GET', body, apiKey } = {}) {
  const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalBody = apiKey && body ? { apiKey, ...body } : body;
  const response = await fetch(`http://127.0.0.1:8080${routeWithKey}`, {
    method,
    headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
    body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
    redirect: 'follow'
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, text, json };
}
async function waitForServer(server) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited early with ${server.exitCode}`);
    try {
      const response = await request('/api/social/keys/verify?apiKey=probe');
      if (response.status === 200 || response.status === 404) return;
    } catch {}
    await wait(250);
  }
  throw new Error('Server did not become ready on 127.0.0.1:8080');
}
async function seedKey() {
  const db = new DosDB(dbRoot);
  await db.init();
  const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'profile heichel creation' } };
  const created = await createApiKey({ $i, userid: userId });
  return created.success.key;
}
async function main() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const apiKey = await seedKey();
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')] });
  try {
    await waitForServer(server);
    const alias = await request('/api/social/aliases', { method: 'POST', apiKey, body: { aliasName: 'Profile Forge', inputId: aliasId, description: 'profile heichel owner' } });
    assert.equal(alias.status, 200, `alias failed ${alias.text}`);
    const created = await request(`/api/social/alias/${encodeURIComponent(aliasId)}/heichelos`, {
      method: 'POST', apiKey,
      body: { name: 'Profile Forged Heichel', heichelName: 'Profile Forged Heichel', description: 'created from profile forge test', heichelId, inputId: heichelId, aliasId, isPublic: 'yes' }
    });
    assert.equal(created.status, 200, `heichel create failed ${created.text}`);
    assert.equal(created.json?.success?.details?.heichelId, heichelId, `heichel create shape ${created.text}`);
    const direct = await request(`/api/social/heichelos/${encodeURIComponent(heichelId)}`, { apiKey });
    assert.equal(direct.status, 200, `direct read failed ${direct.text}`);
    assert.equal(direct.json?.author, aliasId, `direct author mismatch ${direct.text}`);
    const listed = await request(`/api/social/alias/${encodeURIComponent(aliasId)}/heichelos/details`, { apiKey });
    assert.equal(listed.status, 200, `heichel list failed ${listed.text}`);
    assert.ok(Array.isArray(listed.json), `expected list ${listed.text}`);
    assert.ok(listed.json.some(item => item.id === heichelId), `created heichel missing ${listed.text}`);
    console.log('B"H profileHeichelCreation.test passed', JSON.stringify({ userId, aliasId, heichelId }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(250);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exit(1); });
