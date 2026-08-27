// B"H
/**
 * Chapter 137: localhost upload and editor flow with generated image/audio.
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
const suffix = Date.now().toString(36);
const tmpDir = path.join(repoRoot, `.awtsmoos/tmp/live-editor-assets-${suffix}`);
const userId = `BH_UPLOAD_USER_${suffix}`;
const aliasId = `upload_alias_${suffix}`;
const heichelId = `upload_heichel_${suffix}`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(route, { method = 'GET', body, apiKey } = {}) {
  const response = await fetch(`http://127.0.0.1:8080${route}`, { method, headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, body: body ? new URLSearchParams(body).toString() : undefined });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, text, json };
}

async function waitForServer(server) {
  for (let i = 0; i < 40; i++) {
    if (server.exitCode !== null) throw new Error(`server exited ${server.exitCode}`);
    try { if ((await request('/api/social/')).status === 200) return; } catch {}
    await wait(250);
  }
  throw new Error('server not ready');
}

async function seed() {
  const db = new DosDB(dbRoot);
  await db.init();
  await db.write(`/users/${userId}/aliases/${aliasId}`, { aliasId, name: 'Upload Alias' });
  await db.write(`/social/aliases/${aliasId}/info`, { user: userId, name: 'Upload Alias' });
  await db.write(`/social/aliases/${aliasId}/heichelosCreated`, { [heichelId]: true });
  await db.write(`/social/heichelos/${heichelId}/info`, { name: 'Upload Heichel', author: aliasId });
  const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'live upload' } };
  return (await createApiKey({ $i, userid: userId })).success.key;
}

async function main() {
  fs.mkdirSync(tmpDir, { recursive: true });
  const apiKey = await seed();
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, ...cryptoRandom(64)]);
  const wav = Buffer.from([0x52, 0x49, 0x46, 0x46, ...cryptoRandom(80)]);
  fs.writeFileSync(path.join(tmpDir, 'random.png'), png);
  fs.writeFileSync(path.join(tmpDir, 'random.wav'), wav);
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')] });
  try {
    await waitForServer(server);
    const img = await request(`/api/social/assets/${aliasId}/upload`, { method: 'POST', apiKey, body: { fileBase64: png.toString('base64'), filename: 'random.png', mime: 'image/png', attachKind: 'verse', postId: 'p1', verseId: 'v1' } });
    assert.ok(img.json.success, img.text);
    const audio = await request(`/api/social/assets/${aliasId}/upload`, { method: 'POST', apiKey, body: { fileBase64: wav.toString('base64'), filename: 'random.wav', mime: 'audio/wav', attachKind: 'subsection', postId: 'p1', verseId: 'v1', subsectionId: 's1' } });
    assert.ok(audio.json.success, audio.text);
    const draft = await request('/api/social/editor/posts/drafts', { method: 'POST', apiKey, body: { aliasId, heichelId, seriesId: 'root', title: 'Live Structured Post', description: 'Root with assets', verses: JSON.stringify([{ id: 'v1', label: 'Verse One', text: 'Text', assets: [img.json.success[0]], subsections: [{ id: 's1', title: 'Sub', text: 'Audio here', assets: [audio.json.success[0]] }] }]) } });
    assert.ok(draft.json.success?.id, draft.text);
    const published = await request('/api/social/editor/posts/drafts/publish', { method: 'POST', apiKey, body: { aliasId, draftId: draft.json.success.id } });
    assert.ok(published.json.success?.post?.postId, published.text);
    const list = await request(`/api/social/assets/${aliasId}`);
    assert.ok(list.json.success.length >= 2, 'assets list should include image and audio');
    console.log('B"H liveEditorAssetsUpload.test passed', JSON.stringify({ aliasId, heichelId, assets: list.json.success.length }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(250);
  }
}

function cryptoRandom(length) { return Array.from({ length }, () => Math.floor(Math.random() * 255)); }
main().catch(error => { console.error(error); process.exit(1); });
