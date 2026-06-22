// B"H
/**
 * Live social profile/history matrix.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../geelooy/api/social/helper/apiKeys.js');
const origin = 'http://127.0.0.1:8080';
const dbRoot = path.resolve(process.cwd(), '../../dayuhChadash');
const run = `awtsSocial_${Date.now().toString(36)}`;
const userId = `${run}_user`;
const aliasId = `${run}_alias`;
const heichelId = `${run}_heichel`;
const seriesId = `${run}_series`;
const postId = `${run}_post`;
const report = { run, pass: [], cleanup: [] };
function mark(name, extra = {}) { report.pass.push({ name, ...extra }); }
async function apiKey() {
  const db = new DosDB(dbRoot); await db.init();
  const made = await createApiKey({ $i: { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'profile history matrix' } }, userid: userId });
  return made.success.key;
}
async function req(route, { method = 'GET', data = null, apiKey = '' } = {}) {
  const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalData = apiKey && data ? { apiKey, ...data } : data;
  const response = await fetch(origin + routeWithKey, { method, headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalData ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) }, body: finalData ? new URLSearchParams(finalData).toString() : undefined, redirect: 'follow' });
  const text = await response.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 200) }; }
  return { status: response.status, json, text };
}
async function must(name, promise) {
  const res = await promise;
  assert.ok(res.status >= 200 && res.status < 300 && !res.json?.error, `${name}: ${res.status} ${res.text}`);
  mark(name, { status: res.status });
  return res;
}
async function cleanup() {
  const residue = [];
  function walk(dir) { if (!fs.existsSync(dir)) return; for (const name of fs.readdirSync(dir)) { const p = path.join(dir, name); if (name.includes(run)) residue.push(p); else if (fs.statSync(p).isDirectory()) walk(p); } }
  walk(dbRoot);
  for (const p of residue.sort((a, b) => b.length - a.length)) if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true, force: true }); report.cleanup.push(p); }
}
try {
  const key = await apiKey();
  await must('create alias', req('/api/social/aliases', { method: 'POST', apiKey: key, data: { aliasName: 'Social Matrix', inputId: aliasId, description: run } }));
  await must('create heichel', req(`/api/social/alias/${aliasId}/heichelos`, { method: 'POST', apiKey: key, data: { aliasId, inputId: heichelId, heichelId, name: run, heichelName: run, description: run, isPublic: 'yes' } }));
  await must('create series', req(`/api/social/heichelos/${heichelId}/addNewSeries`, { method: 'POST', apiKey: key, data: { aliasId, inputId: seriesId, seriesId, seriesName: run, title: run, parentSeriesId: 'root', description: run } }));
  await must('create post', req(`/api/social/content/heichelos/${heichelId}/posts`, { method: 'POST', apiKey: key, data: { aliasId, postId, title: run, content: run, seriesId, sections: JSON.stringify([{ id: `${run}_section`, title: run, content: run }]) } }));
  await must('create comment', req(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, { method: 'POST', apiKey: key, data: { aliasId, seriesId, content: run, dayuh: JSON.stringify({ verseSection: 'root', run }) } }));
  await must('record post history', req(`/api/social/alias/${aliasId}/history`, { method: 'POST', apiKey: key, data: { type: 'post', id: postId, postId, seriesId, heichelId, title: run, url: `/heichelos/${heichelId}/series/${seriesId}/${postId}` } }));
  await must('record heichel history dedupe source', req(`/api/social/alias/${aliasId}/history`, { method: 'POST', apiKey: key, data: { type: 'heichel', id: heichelId, heichelId, title: run, url: `/heichelos/${heichelId}` } }));
  const profile = await must('aggregate profile includes social arrays', req(`/api/social/profile/${aliasId}`, { apiKey: key }));
  assert.ok(Array.isArray(profile.json.posts) && profile.json.posts.some(p => p.postId === postId), 'profile posts missing created post');
  assert.ok(Array.isArray(profile.json.history) && profile.json.history.length >= 2, 'profile history missing records');
  assert.ok(Array.isArray(profile.json.activity), 'profile activity missing');
  mark('profile arrays verified', { posts: profile.json.posts.length, history: profile.json.history.length, activity: profile.json.activity.length });
  await must('activity endpoint', req(`/api/social/profile/${aliasId}/activity`, { apiKey: key }));
  const history = await must('history endpoint', req(`/api/social/alias/${aliasId}/history`, { apiKey: key }));
  assert.ok(history.json.success.length >= 2, 'history endpoint too short');
  await must('clear history endpoint', req(`/api/social/alias/${aliasId}/history`, { method: 'DELETE', apiKey: key, data: { aliasId } }));
  const cleared = await must('history cleared', req(`/api/social/alias/${aliasId}/history`, { apiKey: key }));
  assert.equal(cleared.json.success.length, 0, 'history did not clear');
  await must('profile page history hash loads', req(`/@${aliasId}#history`, { apiKey: key }));
  await must('delete heichel cleanup api', req(`/api/social/alias/${aliasId}/heichelos/${heichelId}`, { method: 'DELETE', apiKey: key, data: { aliasId } }));
  await cleanup();
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.error = String(error.stack || error);
  await cleanup().catch(() => {});
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
