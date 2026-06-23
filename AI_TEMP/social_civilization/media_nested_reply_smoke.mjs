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
const run = `nested_reply_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
const ids = { user: `${run}_user`, alias: `${run}_alias`, heichel: `${run}_heichel`, post: `${run}_post`, section: `${run}_comment_section` };

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
  await db.write(`/users/${ids.user}/aliases/${ids.alias}`, { aliasId: ids.alias, name: 'Nested Reply Alias' });
  await db.write(`/social/aliases/${ids.alias}/info`, { user: ids.user, name: 'Nested Reply Alias' });
  await db.write(`/social/aliases/${ids.alias}/heichelosCreated`, { [ids.heichel]: true });
  await db.write(`/social/heichelos/${ids.heichel}/info`, { name: 'Nested Reply Heichel', author: ids.alias, description: run });
  await db.write(`/social/heichelos/${ids.heichel}/series/root/info`, { id: 'root', name: 'Root', parentSeriesId: '' });
  const $i = { db, request: { user: { info: { userId: ids.user } }, headers: {} }, $_POST: { label: 'nested reply media' } };
  const key = await createApiKey({ $i, userid: ids.user });
  return { db, apiKey: key.success.key };
}

function wav(seed) { return Buffer.from(Array.from({ length: 96 }, (_, i) => (i * seed) % 255)); }
async function upload(apiKey, name, mime = 'audio/wav') {
  const res = await req(`/api/social/assets/${ids.alias}/upload`, { method: 'POST', apiKey, body: { filename: name, mime, attachKind: 'reply', postId: ids.post, fileBase64: wav(name.length).toString('base64') } });
  assert.equal(res.status, 200, res.text);
  assert.ok(res.json.success?.[0]?.publicPath, res.text);
  return res.json.success[0];
}

function mediaBody(asset, content, audioNoteText = '') {
  return { aliasId: ids.alias, seriesId: 'root', content, audioNoteText, parentSectionId: ids.section, assets: JSON.stringify([asset]), sections: JSON.stringify([{ id: ids.section, title: 'reply section', content: `${content} section`, assets: [asset] }]) };
}

async function main() {
  const { db, apiKey } = await seed();
  const rootAsset = await upload(apiKey, `${run}_root.wav`);
  const replyAsset = await upload(apiKey, `${run}_reply.wav`);
  const sectionReplyAsset = await upload(apiKey, `${run}_section_reply.wav`);

  const root = await req(`/api/social/heichelos/${ids.heichel}/posts/${ids.post}/comment-tree`, { method: 'POST', apiKey, body: mediaBody(rootAsset, 'root media comment', 'root voice') });
  assert.equal(root.status, 200, root.text);
  const rootId = root.json.success.id;
  assert.equal(root.json.success.assets[0].id, rootAsset.id);
  assert.equal(root.json.success.sections[0].assets[0].id, rootAsset.id);

  const reply = await req(`/api/social/heichelos/${ids.heichel}/posts/${ids.post}/comments/${rootId}/replies`, { method: 'POST', apiKey, body: mediaBody(replyAsset, 'reply media comment', 'reply voice') });
  assert.equal(reply.status, 200, reply.text);
  const replyId = reply.json.success.id;
  assert.equal(reply.json.success.parentId, rootId);
  assert.equal(reply.json.success.assets[0].id, replyAsset.id);

  const sectionReply = await req(`/api/social/heichelos/${ids.heichel}/posts/${ids.post}/comments/${replyId}/sections/${ids.section}/replies`, { method: 'POST', apiKey, body: mediaBody(sectionReplyAsset, 'section reply media', 'section reply voice') });
  assert.equal(sectionReply.status, 200, sectionReply.text);
  assert.equal(sectionReply.json.success.parentId, replyId);
  assert.equal(sectionReply.json.success.parentSectionId, ids.section);
  assert.equal(sectionReply.json.success.assets[0].id, sectionReplyAsset.id);

  const tree = await req(`/api/social/heichelos/${ids.heichel}/posts/${ids.post}/comment-tree?seriesId=root`, { apiKey });
  assert.equal(tree.status, 200, tree.text);
  const rootNode = tree.json.success.find(comment => comment.id === rootId);
  assert.ok(rootNode, 'root comment in tree');
  assert.equal(rootNode.replies[0].id, replyId, 'reply nested under root');
  assert.equal(rootNode.replies[0].replies[0].id, sectionReply.json.success.id, 'section reply nested under reply');
  assert.ok(renderEntityMedia({ id: 'nestedReplyTree', media: rootNode.assets, sections: rootNode.sections }).includes('bh-social-gallery'));

  await db.delete(`/social/heichelos/${ids.heichel}`).catch(() => {});
  await db.delete(`/social/aliases/${ids.alias}`).catch(() => {});
  await db.delete(`/users/${ids.user}`).catch(() => {});
  fs.rmSync(path.join(dbRoot, 'socialAssets', 'aliases', ids.alias), { recursive: true, force: true });
  console.log(JSON.stringify({ BH: 'B"H', pass: true, checked: ['rootCommentMedia', 'replyMedia', 'sectionReplyMedia', 'treeNesting', 'renderer'] }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
