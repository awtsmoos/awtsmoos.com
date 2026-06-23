// B"H
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { renderEntityMedia } from '../../geelooy/scripts/awtsmoos/social/media/renderEntityMedia.js';

const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../geelooy/api/social/helper/apiKeys.js');
const origin = process.env.AWTS_STRESS_ORIGIN || 'http://127.0.0.1:8080';
const dbRoot = path.resolve(process.cwd(), '../../dayuhChadash');
const run = `media_deep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
const ids = { user: `${run}_user`, alias: `${run}_alias`, heichel: `${run}_heichel`, post: `${run}_post`, question: `${run}_question`, answer: `${run}_answer`, section: `${run}_section`, segment: `${run}_segment` };

async function req(route, { method = 'GET', body, apiKey } = {}) {
  const response = await fetch(origin + route, { method, headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, body: body ? new URLSearchParams(body).toString() : undefined });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, text, json };
}

async function seed() {
  const db = new DosDB(dbRoot);
  await db.init();
  await db.write(`/users/${ids.user}/aliases/${ids.alias}`, { aliasId: ids.alias, name: 'Deep Media Alias' });
  await db.write(`/social/aliases/${ids.alias}/info`, { user: ids.user, name: 'Deep Media Alias' });
  await db.write(`/social/aliases/${ids.alias}/heichelosCreated`, { [ids.heichel]: true });
  await db.write(`/social/heichelos/${ids.heichel}/info`, { name: 'Deep Media Heichel', author: ids.alias, description: run });
  await db.write(`/social/heichelos/${ids.heichel}/series/root/info`, { id: 'root', name: 'Root', parentSeriesId: '' });
  const $i = { db, request: { user: { info: { userId: ids.user } }, headers: {} }, $_POST: { label: 'deep media' } };
  const key = await createApiKey({ $i, userid: ids.user });
  return { db, apiKey: key.success.key };
}

function bytes(seed) { return Buffer.from(Array.from({ length: 80 }, (_, i) => (i * seed) % 255)); }
async function upload(apiKey, filename, mime, attachKind) {
  const res = await req(`/api/social/assets/${ids.alias}/upload`, { method: 'POST', apiKey, body: { filename, mime, attachKind, postId: ids.post, fileBase64: bytes(filename.length).toString('base64') } });
  assert.equal(res.status, 200, res.text);
  return res.json.success[0];
}

async function main() {
  const { db, apiKey } = await seed();
  const image = await upload(apiKey, `${run}.png`, 'image/png', 'post');
  const audio = await upload(apiKey, `${run}.wav`, 'audio/wav', 'comment');
  const voice = await upload(apiKey, `${run}.m4a`, 'audio/m4a', 'answer');
  const assets = [image, audio, voice];
  const rootAssets = JSON.stringify(assets);
  const sections = JSON.stringify([{ id: ids.section, title: 'Deep Section', assets: [image], segments: [{ id: ids.segment, title: 'Deep Segment', assets: [audio, voice] }] }]);

  const listed = await req(`/api/social/assets/${ids.alias}`, { apiKey });
  assert.equal(listed.status, 200, listed.text);
  assert.ok(listed.json.success.length >= 3, 'asset list includes uploads');
  for (const asset of assets) {
    const manifest = await req(`/api/social/assets/${ids.alias}/manifest/${asset.id}`, { apiKey });
    assert.equal(manifest.status, 200, manifest.text);
    assert.equal(manifest.json.success.id, asset.id);
    assert.ok(renderEntityMedia({ id: asset.id, media: [manifest.json.success] }).includes('bh-social-gallery'));
  }

  const post = await req(`/api/social/content/heichelos/${ids.heichel}/posts`, { method: 'POST', apiKey, body: { aliasId: ids.alias, postId: ids.post, title: 'Deep Post', content: 'post', seriesId: 'root', rootAssets, sections } });
  assert.equal(post.status, 200, post.text);
  const question = await req(`/api/social/content/heichelos/${ids.heichel}/questions`, { method: 'POST', apiKey, body: { aliasId: ids.alias, questionId: ids.question, title: 'Deep Question', content: 'question', seriesId: 'root', rootAssets, sections } });
  assert.equal(question.status, 200, question.text);
  const answer = await req(`/api/social/content/heichelos/${ids.heichel}/questions/${ids.question}/answers`, { method: 'POST', apiKey, body: { aliasId: ids.alias, answerId: ids.answer, title: 'Deep Answer', content: 'answer', seriesId: 'root', rootAssets, sections } });
  assert.equal(answer.status, 200, answer.text);

  const comment = await req(`/api/social/heichelos/${ids.heichel}/posts/${ids.post}/comment-tree`, { method: 'POST', apiKey, body: { aliasId: ids.alias, seriesId: 'root', content: 'deep comment', assets: rootAssets, audioNoteText: 'deep voice', sections } });
  assert.equal(comment.status, 200, comment.text);
  assert.equal(comment.json.success.assets.length, 3);
  assert.equal(comment.json.success.sections[0].assets[0].id, image.id);

  const mount = await req(`/api/social/node-os/mount/assets/${ids.alias}`, { method: 'POST', apiKey, body: {} });
  assert.equal(mount.status, 200, mount.text);
  assert.ok(mount.json.success.length >= 3, 'mounted all assets');
  const nodePath = `/Aliases/${ids.alias}/Assets/${image.type}/${image.id}`;
  const node = await req(`/api/social/node-os/path?path=${encodeURIComponent(nodePath)}`, { apiKey });
  assert.equal(node.status, 200, node.text);
  assert.equal(node.json.success.source.assetId, image.id);

  await db.delete(`/social/heichelos/${ids.heichel}`).catch(() => {});
  await db.delete(`/social/aliases/${ids.alias}`).catch(() => {});
  await db.delete(`/users/${ids.user}`).catch(() => {});
  fs.rmSync(path.join(dbRoot, 'socialAssets', 'aliases', ids.alias), { recursive: true, force: true });
  console.log(JSON.stringify({ BH: 'B"H', pass: true, checked: ['assetList', 'manifest', 'post', 'question', 'answer', 'comment', 'nodeOsPath', 'renderer'] }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
