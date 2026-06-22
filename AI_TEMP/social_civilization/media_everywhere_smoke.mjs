// B"H
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../geelooy/api/social/helper/apiKeys.js');

const origin = 'http://127.0.0.1:8080';
const repoRoot = process.cwd();
const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
const run = `media_everywhere_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
const ids = {
  user: `${run}_user`,
  alias: `${run}_alias`,
  heichel: `${run}_heichel`,
  series: 'root',
  post: `${run}_post`,
  question: `${run}_question`,
  answer: `${run}_answer`,
  verse: `${run}_verse`,
  subsection: `${run}_subsection`
};

async function request(route, { method = 'GET', body, apiKey } = {}) {
  const response = await fetch(origin + route, {
    method,
    headers: {
      ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}),
      ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
    },
    body: body ? new URLSearchParams(body).toString() : undefined
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, ok: response.status >= 200 && response.status < 300, text, json };
}

async function seed() {
  const db = new DosDB(dbRoot);
  await db.init();
  await db.write(`/users/${ids.user}/aliases/${ids.alias}`, { aliasId: ids.alias, name: 'Media Everywhere Alias' });
  await db.write(`/social/aliases/${ids.alias}/info`, { user: ids.user, name: 'Media Everywhere Alias' });
  await db.write(`/social/aliases/${ids.alias}/heichelosCreated`, { [ids.heichel]: true });
  await db.write(`/social/heichelos/${ids.heichel}/info`, { name: 'Media Everywhere Heichel', author: ids.alias, description: run });
  await db.write(`/social/heichelos/${ids.heichel}/series/root/info`, { id: 'root', name: 'Root', parentSeriesId: '' });
  await db.write(`/social/heichelos/${ids.heichel}/series/root/posts`, {});
  const $i = { db, request: { user: { info: { userId: ids.user } }, headers: {} }, $_POST: { label: 'media everywhere' } };
  const key = await createApiKey({ $i, userid: ids.user });
  return { apiKey: key.success.key, db };
}

function tinyPng() { return Buffer.from([0x89,0x50,0x4e,0x47,13,10,26,10,0,0,0,13,73,72,68,82, ...Array.from({ length: 48 }, (_, i) => i % 255)]); }
function tinyWav() { return Buffer.from([0x52,0x49,0x46,0x46,36,0,0,0,0x57,0x41,0x56,0x45,0x66,0x6d,0x74,0x20, ...Array.from({ length: 72 }, (_, i) => (i * 3) % 255)]); }

async function upload(apiKey, file, body) {
  const res = await request(`/api/social/assets/${ids.alias}/upload`, { method: 'POST', apiKey, body: { fileBase64: file.toString('base64'), ...body } });
  assert.equal(res.status, 200, res.text);
  assert.ok(res.json.success?.[0]?.publicPath, res.text);
  return res.json.success[0];
}

async function main() {
  const { apiKey, db } = await seed();
  const image = await upload(apiKey, tinyPng(), { filename: `${run}.png`, mime: 'image/png', attachKind: 'verse', postId: ids.post, verseId: ids.verse });
  const audio = await upload(apiKey, tinyWav(), { filename: `${run}.wav`, mime: 'audio/wav', attachKind: 'subsection', postId: ids.post, verseId: ids.verse, subsectionId: ids.subsection });

  assert.equal(image.type, 'image');
  assert.equal(audio.type, 'audio');
  assert.ok(image.ownerOsPath && image.virtualOsPath && image.vaultPath, 'image has OS paths');
  assert.ok(audio.ownerOsPath && audio.virtualOsPath && audio.vaultPath, 'audio has OS paths');

  const imageServe = await fetch(origin + image.publicPath);
  assert.equal(imageServe.status, 200, 'image publicPath serves');
  assert.ok((imageServe.headers.get('content-type') || '').includes('image/png'));

  const audioServe = await fetch(origin + audio.publicPath);
  assert.equal(audioServe.status, 200, 'audio publicPath serves');
  assert.ok((audioServe.headers.get('content-type') || '').includes('audio/wav'));

  const sections = JSON.stringify([{ id: ids.verse, verseSection: ids.verse, title: 'Verse with image', content: 'Verse content', assets: [image], segments: [{ id: ids.subsection, title: 'Voice subsection', content: 'Audio subsection', assets: [audio] }] }]);
  const rootAssets = JSON.stringify([image, audio]);

  const post = await request(`/api/social/content/heichelos/${ids.heichel}/posts`, { method: 'POST', apiKey, body: { aliasId: ids.alias, postId: ids.post, title: `${run} post`, content: 'post root', seriesId: ids.series, rootAssets, sections } });
  assert.equal(post.status, 200, post.text);
  assert.equal(post.json.success.rootAssets.length, 2, 'post root assets kept');
  assert.equal(post.json.success.sections[0].assets[0].id, image.id, 'post verse image kept');
  assert.equal(post.json.success.sections[0].segments[0].assets[0].id, audio.id, 'post subsection audio kept');

  const question = await request(`/api/social/content/heichelos/${ids.heichel}/questions`, { method: 'POST', apiKey, body: { aliasId: ids.alias, questionId: ids.question, title: `${run} question`, content: 'question root', seriesId: ids.series, rootAssets, sections } });
  assert.equal(question.status, 200, question.text);
  assert.equal(question.json.success.contentType, 'question');
  assert.equal(question.json.success.rootAssets.length, 2, 'question root assets kept');

  const answer = await request(`/api/social/content/heichelos/${ids.heichel}/questions/${ids.question}/answers`, { method: 'POST', apiKey, body: { aliasId: ids.alias, answerId: ids.answer, title: `${run} answer`, content: 'voice answer', seriesId: ids.series, rootAssets, sections } });
  assert.equal(answer.status, 200, answer.text);
  assert.equal(answer.json.success.contentType, 'answer');
  assert.equal(answer.json.success.rootAssets.length, 2, 'answer root assets kept');

  const commentAssets = JSON.stringify([image, audio]);
  const commentSections = JSON.stringify([{ id: 'comment_section_voice', title: 'Comment voice verse', content: 'comment section', assets: [audio], links: [{ kind: 'post', postId: ids.post, label: 'Post with image' }] }]);
  const comment = await request(`/api/social/heichelos/${ids.heichel}/posts/${ids.post}/comment-tree`, { method: 'POST', apiKey, body: { aliasId: ids.alias, seriesId: ids.series, content: 'comment with image and voice', audioNoteText: 'voice transcript', verseSection: ids.verse, assets: commentAssets, sections: commentSections } });
  assert.equal(comment.status, 200, comment.text);
  assert.equal(comment.json.success.assets.length, 2, 'comment assets kept');
  assert.equal(comment.json.success.sections[0].assets[0].id, audio.id, 'comment section audio kept');
  assert.equal(comment.json.success.audioNoteText, 'voice transcript');

  const qComment = await request(`/api/social/heichelos/${ids.heichel}/questions/${ids.question}/comment-tree`, { method: 'POST', apiKey, body: { aliasId: ids.alias, seriesId: ids.series, content: 'question comment media', assets: commentAssets, audioNoteText: 'question voice' } });
  assert.equal(qComment.status, 200, qComment.text);
  assert.equal(qComment.json.success.assets.length, 2, 'question comment assets kept');

  const aComment = await request(`/api/social/heichelos/${ids.heichel}/answers/${ids.answer}/comment-tree`, { method: 'POST', apiKey, body: { aliasId: ids.alias, seriesId: ids.series, content: 'answer comment media', assets: commentAssets, audioNoteText: 'answer voice' } });
  assert.equal(aComment.status, 200, aComment.text);
  assert.equal(aComment.json.success.assets.length, 2, 'answer comment assets kept');

  const bind = await request(`/api/social/assets/${ids.alias}/${image.id}/bind`, { method: 'POST', apiKey, body: { role: 'hero', target: JSON.stringify({ kind: 'entity', heichelId: ids.heichel, seriesId: ids.series, entityType: 'post', entityId: ids.post, nodeId: ids.verse, commentId: comment.json.success.id }) } });
  assert.equal(bind.status, 200, bind.text);
  assert.ok(bind.json.success.bindings.length >= 1, 'asset binding stored');
  assert.ok(bind.json.success.ownerOsPath.includes('/os/aliases/'), 'binding exposes owner OS path');

  const mount = await request(`/api/social/node-os/mount/assets/${ids.alias}`, { method: 'POST', apiKey, body: {} });
  assert.equal(mount.status, 200, mount.text);
  assert.ok(mount.json.success || mount.json.ok, 'node-os asset mount returns success-ish');

  const residuePaths = [
    `/social/heichelos/${ids.heichel}`,
    `/social/aliases/${ids.alias}`,
    `/users/${ids.user}`,
    `/social/aliases/${ids.alias}/assets`
  ];
  for (const p of residuePaths) await db.delete(p).catch(() => {});
  const assetDir = path.join(dbRoot, 'socialAssets', 'aliases', ids.alias);
  fs.rmSync(assetDir, { recursive: true, force: true });

  console.log(JSON.stringify({ pass: true, run, verified: ['imageUploadServe', 'audioUploadServe', 'postRootVerseSubsectionAssets', 'questionAssets', 'answerAssets', 'postComments', 'questionComments', 'answerComments', 'assetBindingOsPaths', 'nodeOsAssetMount'], image: image.publicPath, audio: audio.publicPath }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
