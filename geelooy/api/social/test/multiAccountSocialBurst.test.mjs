//B"H
/**
 * Chapter 34: multi-account social burst.
 *
 * Creates five users, verifies API-key login, creates five aliases, creates one
 * Heichel, writes twenty segment-aware posts, adds one verse-anchored comment
 * per post across those aliases, adds replies on five posts, edits three
 * comments, reads sections/authors back, and revokes one key as logout proof.
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
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/multi-account-social-burst');
const suffix = Date.now().toString(36);
const runId = `BH_BURST_${suffix}`;
const heichelId = `burstHeichel_${suffix}`;
const seriesId = 'root';
const accountCount = 5;
const postCount = 20;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function rawRequest(route, { method = 'GET', body, apiKey } = {}) {
  const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalBody = apiKey && body ? { apiKey, ...body } : body;
  const response = await fetch(`http://127.0.0.1:8080${routeWithKey}`, {
    method,
    headers: {
      ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}),
      ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
    },
    body: finalBody ? new URLSearchParams(finalBody).toString() : undefined,
    redirect: 'follow'
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, json, text };
}

async function request(route, options, tries = 5) {
  let last;
  for (let attempt = 0; attempt < tries; attempt++) {
    try { return await rawRequest(route, options); }
    catch (error) { last = error; await wait(400 + attempt * 250); }
  }
  throw last;
}

async function waitForServer(server) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited early with ${server.exitCode}`);
    try {
      const response = await request('/api/social/keys/verify?apiKey=probe', {}, 1);
      if (response.status === 200 || response.status === 404) return;
    } catch {}
    await wait(250);
  }
  throw new Error('Server did not become ready on 127.0.0.1:8080');
}

async function seedKey(userId) {
  const db = new DosDB(dbRoot);
  await db.init();
  const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'multi account social burst' } };
  const created = await createApiKey({ $i, userid: userId });
  assert.ok(created.success?.key, `missing api key for ${userId}`);
  return { key: created.success.key, keyId: created.success.record.id };
}

function makeAccounts() {
  return Array.from({ length: accountCount }, (_, index) => ({
    userId: `${runId}_USER_${index + 1}`,
    aliasId: `burst_${index + 1}_${suffix}`,
    name: `Burst Alias ${index + 1}`
  }));
}

function makeSections(postIndex) {
  return Array.from({ length: 3 }, (_, sectionIndex) => ({
    id: `verse_${postIndex + 1}_${sectionIndex + 1}`,
    title: `Verse ${sectionIndex + 1}`,
    verseSection: `verse-${sectionIndex + 1}`,
    segmentType: sectionIndex === 0 ? 'source' : 'commentary',
    order: sectionIndex + 1,
    content: `B'H verse ${sectionIndex + 1} for post ${postIndex + 1}.`,
    segments: [0, 1].map(segmentIndex => ({
      id: `segment_${postIndex + 1}_${sectionIndex + 1}_${segmentIndex + 1}`,
      label: `Segment ${segmentIndex + 1}`,
      content: `Nested segment ${segmentIndex + 1}.`,
      order: segmentIndex + 1
    }))
  }));
}

async function createAliases(accounts) {
  for (const account of accounts) {
    const verify = await request('/api/social/keys/verify', { apiKey: account.apiKey });
    assert.equal(verify.status, 200, `login verify failed ${verify.text}`);
    assert.equal(verify.json?.success?.userId, account.userId, `wrong login user ${verify.text}`);
    const alias = await request('/api/social/aliases', { method: 'POST', apiKey: account.apiKey, body: { aliasName: account.name, inputId: account.aliasId, description: `${account.name} created by ${runId}` } });
    assert.equal(alias.status, 200, `alias create failed ${alias.text}`);
  }
}

async function createHeichel(accounts) {
  const db = new DosDB(dbRoot);
  await db.init();
  await db.write(`/social/heichelos/${heichelId}/info`, { name: `${runId} Heichel`, description: 'Twenty-post social burst Heichel.', author: accounts[0].aliasId });
  await db.write(`/social/heichelos/${heichelId}/editors`, accounts.map(account => account.aliasId));
  await db.write(`/social/heichelos/${heichelId}/public`, { public: true });
}

async function createPosts(accounts) {
  const posts = [];
  for (let index = 0; index < postCount; index++) {
    const account = accounts[index % accounts.length];
    const postId = `burstPost_${suffix}_${index + 1}`;
    const response = await request(`/api/social/content/heichelos/${encodeURIComponent(heichelId)}/posts`, {
      method: 'POST', apiKey: account.apiKey,
      body: { aliasId: account.aliasId, postId, title: `B'H Burst Post ${index + 1}`, content: `Immense social post ${index + 1}.`, seriesId, sections: JSON.stringify(makeSections(index)) }
    });
    assert.equal(response.status, 200, `post ${index + 1} failed ${response.text}`);
    assert.equal(response.json?.success?.contentType, 'post', `post ${index + 1} shape ${response.text}`);
    posts.push({ postId, author: account.aliasId, apiKey: account.apiKey, index });
  }
  return posts;
}

async function addComments(accounts, posts) {
  const comments = [];
  for (const [postIndex, post] of posts.entries()) {
    const account = accounts[postIndex % accounts.length];
    const verseSection = `verse-${(postIndex % 3) + 1}`;
    const response = await request(`/api/social/heichelos/${encodeURIComponent(heichelId)}/post/${encodeURIComponent(post.postId)}/comments/`, {
      method: 'POST', apiKey: account.apiKey,
      body: { aliasId: account.aliasId, seriesId, content: `B'H comment on ${post.postId} at ${verseSection}.`, dayuh: JSON.stringify({ verseSection, segmentId: `segment_${postIndex + 1}_${(postIndex % 3) + 1}_1`, runId }) }
    });
    assert.equal(response.status, 200, `comment failed ${response.text}`);
    assert.equal(response.json?.success, true, `comment shape ${response.text}`);
    comments.push({ ...post, commentId: response.json.details.id, aliasId: account.aliasId, apiKey: account.apiKey, verseSection });
  }
  return comments;
}

async function addReplies(accounts, comments) {
  for (const [index, parent] of comments.slice(0, 5).entries()) {
    const replyAccount = accounts[(index + 2) % accounts.length];
    const reply = await request(`/api/social/heichelos/${encodeURIComponent(heichelId)}/comment/${encodeURIComponent(parent.commentId)}`, {
      method: 'POST', apiKey: replyAccount.apiKey,
      body: { postId: parent.postId, seriesId, aliasId: replyAccount.aliasId, content: `B'H reply to ${parent.commentId}.`, dayuh: JSON.stringify({ verseSection: parent.verseSection, replyToId: parent.commentId, runId }) }
    });
    assert.equal(reply.status, 200, `reply failed ${reply.text}`);
    assert.equal(reply.json?.success, true, `reply shape ${reply.text}`);
  }
}

async function editSomeComments(comments) {
  for (const comment of comments.slice(0, 3)) {
    const response = await request(`/api/social/heichelos/${encodeURIComponent(heichelId)}/comment/${encodeURIComponent(comment.commentId)}`, {
      method: 'PUT', apiKey: comment.apiKey,
      body: { aliasId: comment.aliasId, parentType: 'post', parentId: comment.postId, postId: comment.postId, seriesId, verseSection: comment.verseSection, content: `B'H EDITED ${comment.commentId}.`, dayuh: JSON.stringify({ verseSection: comment.verseSection, edited: true, runId }) }
    });
    assert.equal(response.status, 200, `edit failed ${response.text}`);
    assert.equal(response.json?.success, true, `edit shape ${response.text}`);
  }
}

async function verifyReads(accounts, posts, comments) {
  const first = posts[0];
  const sections = await request(`/api/social/content/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(first.postId)}/sections`, { apiKey: accounts[0].apiKey });
  assert.equal(sections.status, 200, `sections read failed ${sections.text}`);
  assert.equal(sections.json?.success?.length, 3, `sections count failed ${sections.text}`);
  assert.ok(sections.json.success[0].segments?.length === 2, `segments missing ${sections.text}`);
  const authors = await request(`/api/social/heichelos/${encodeURIComponent(heichelId)}/post/${encodeURIComponent(first.postId)}/comments/aliases?seriesId=${seriesId}&verseSection=${comments[0].verseSection}`, { apiKey: accounts[0].apiKey });
  assert.equal(authors.status, 200, `authors read failed ${authors.text}`);
  assert.ok(authors.json?.success?.includes(comments[0].aliasId), `author missing ${authors.text}`);
}

async function revokeLastKey(accounts) {
  const last = accounts.at(-1);
  const revoked = await request(`/api/social/keys/${encodeURIComponent(last.keyId)}/revoke`, { method: 'POST', apiKey: last.apiKey, body: {} });
  assert.equal(revoked.status, 200, `revoke failed ${revoked.text}`);
  assert.ok(revoked.json?.success?.revokedAt, `revoke shape ${revoked.text}`);
  const verify = await request('/api/social/keys/verify', { apiKey: last.apiKey });
  assert.ok(verify.json?.error || verify.json?.code === 'KEY_NOT_FOUND', `revoked key still verified ${verify.text}`);
}

async function main() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const accounts = makeAccounts();
  for (const account of accounts) {
    const seeded = await seedKey(account.userId);
    account.apiKey = seeded.key;
    account.keyId = seeded.keyId;
  }
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')], env: { ...process.env, AWTSMOOS_REAL_SMOKE_DEBUG: '1', AWTSMOOS_SKIP_COMMENT_VECTORS: '1' } });
  try {
    await waitForServer(server);
    await createAliases(accounts);
    await createHeichel(accounts);
    const posts = await createPosts(accounts);
    const comments = await addComments(accounts, posts);
    await addReplies(accounts, comments);
    await editSomeComments(comments);
    await verifyReads(accounts, posts, comments);
    await revokeLastKey(accounts);
    console.log('B"H multiAccountSocialBurst.test passed', JSON.stringify({ accounts: accounts.length, posts: posts.length, comments: comments.length, replies: 5, edited: 3, heichelId }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(250);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error); process.exit(1); });
