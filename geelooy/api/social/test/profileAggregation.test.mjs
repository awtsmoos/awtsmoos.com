// B"H
/**
 * Chapter 84: Profile aggregation live API test without noisy storage errors.
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
const tmpDir = path.join(repoRoot, '.awtsmoos/tmp/profile-aggregation');
const suffix = Date.now().toString(36);
const userId = `BH_PROFILE_AGG_${suffix}`;
const aliasId = `profile_agg_${suffix}`;
const heichelId = `profileAggHeichel_${suffix}`;
const postId = `profileAggPost_${suffix}`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function request(route, { method = 'GET', body, apiKey } = {}) {
  const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalBody = apiKey && body ? { apiKey, ...body } : body;
  const response = await fetch(`http://127.0.0.1:8080${routeWithKey}`, { method, headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalBody ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, body: finalBody ? new URLSearchParams(finalBody).toString() : undefined, redirect: 'follow' });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, text, json };
}

async function waitForServer(server) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (server.exitCode !== null) throw new Error(`Server exited early with ${server.exitCode}`);
    try { if ((await request('/api/social/profile/templates')).status === 200) return; } catch {}
    await wait(250);
  }
  throw new Error('Server did not become ready');
}

async function seedKey() {
  const db = new DosDB(dbRoot);
  await db.init();
  const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'profile aggregation' } };
  return (await createApiKey({ $i, userid: userId })).success.key;
}

async function seedDirectData() {
  const db = new DosDB(dbRoot);
  await db.init();
  await db.write(`/users/${userId}/aliases/${aliasId}`, { name: 'Profile Aggregator', aliasId, description: 'API-first profile owner' });
  await db.write(`/social/aliases/${aliasId}/info`, { name: 'Profile Aggregator', description: 'API-first profile owner', user: userId });
  await db.write(`/social/aliases/${aliasId}/profile`, { displayName: 'Profile Aggregator', bio: 'Every post and comment becomes visible.', interests: ['Torah', 'Community'], templateId: 'reader-light' });
  await db.write(`/social/aliases/${aliasId}/heichelosCreated`, { [heichelId]: true });
  await db.write(`/social/heichelos/${heichelId}/info`, { name: 'Aggregation Heichel', description: 'Profile tree source', author: aliasId });
  await db.write(`/social/heichelos/${heichelId}/series/rootSeries/info`, { name: 'Root Series' });
  await db.write(`/social/heichelos/${heichelId}/postIds`, { [postId]: true });
  await db.write(`/social/heichelos/${heichelId}/posts/${postId}`, { id: postId, postId, title: 'Profile Aggregation Post', content: 'A post visible from the profile aggregation API.', aliasId, author: aliasId, heichelId, seriesId: 'root', contentType: 'post', createdAt: Date.now(), sections: [{ id: 'verse_one', verseSection: 'verse-1', title: 'Verse One', segments: [{ id: 'seg-one', content: 'segment' }] }] });
  await db.write(`/social/heichelos/${heichelId}/comments/atSeries/root/atPost/${postId}/${aliasId}`, { 'verse-1': [{ id: `comment_${suffix}`, author: aliasId, content: 'This profile comment should wow from a verse anchor.', dayuh: { verseSection: 'verse-1', segmentId: 'seg-one' } }] });
  await db.write(`/social/aliases/${aliasId}/comments/heichel`, { [heichelId]: true });
  await db.write(`/social/aliases/${aliasId}/comments/heichel/${heichelId}/series`, { root: true });
  await db.write(`/social/aliases/${aliasId}/comments/heichel/${heichelId}/series/root/atPost`, { [postId]: true });
}

async function main() {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });
  const apiKey = await seedKey();
  await seedDirectData();
  const server = spawn('node', ['index'], { cwd: repoRoot, stdio: ['ignore', fs.openSync(path.join(tmpDir, 'server.log'), 'w'), fs.openSync(path.join(tmpDir, 'server.err'), 'w')] });
  try {
    await waitForServer(server);
    assert.equal((await request(`/api/social/alias/${aliasId}/profile/template`, { method: 'POST', apiKey, body: { templateId: 'heichel-builder' } })).status, 200);
    const profile = await request(`/api/social/profile/${aliasId}`);
    assert.equal(profile.status, 200, `profile read failed ${profile.text}`);
    assert.equal(profile.json.profile.templateId, 'heichel-builder');
    assert.ok(profile.json.templates.length >= 5, 'templates missing');
    assert.ok(profile.json.posts.some(post => post.postId === postId), 'post missing');
    assert.ok(profile.json.comments.some(comment => comment.segmentId === 'seg-one'), 'comment segment missing');
    assert.ok(profile.json.heichelos.some(item => item.id === heichelId), 'heichel missing');
    assert.ok(profile.json.tree.some(item => item.heichelId === heichelId), 'tree missing');
    console.log('B"H profileAggregation.test passed', JSON.stringify({ aliasId, heichelId, postId }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await wait(250);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch(error => { console.error(error); process.exit(1); });
