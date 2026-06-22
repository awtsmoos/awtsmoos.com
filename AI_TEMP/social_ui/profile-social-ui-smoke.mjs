// B"H
/**
 * Social profile UI/API smoke. Creates synthetic social material, hits the
 * canonical profile social endpoints and public profile hash routes, then
 * removes every path containing the exact run id.
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
const run = `awtsUi_${Date.now().toString(36)}`;
const userId = `${run}_user`;
const aliasId = `${run}_alias`;
const viewerAlias = `${run}_viewer`;
const heichelId = `${run}_heichel`;
const seriesId = `${run}_series`;
const postId = `${run}_post`;
const report = { run, pass: [], cleanup: [] };
const mark = (name, details = {}) => report.pass.push({ name, ...details });
async function apiKey() {
  const db = new DosDB(dbRoot); await db.init();
  const made = await createApiKey({ $i: { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'social ui smoke' } }, userid: userId });
  return made.success.key;
}
async function req(route, { method = 'GET', data = null, key = '' } = {}) {
  const finalData = key && data ? { apiKey: key, ...data } : data;
  const res = await fetch(origin + route, {
    method,
    headers: { ...(key ? { authorization: `Bearer ${key}`, 'x-awtsmoos-api-key': key } : {}), ...(finalData ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
    body: finalData ? new URLSearchParams(finalData).toString() : undefined,
    redirect: 'follow'
  });
  const text = await res.text();
  let json; try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 300) }; }
  return { status: res.status, json, text };
}
async function must(name, promise, check = () => true) {
  const res = await promise;
  assert.ok(res.status >= 200 && res.status < 300, `${name} HTTP ${res.status}: ${res.text}`);
  assert.ok(check(res), `${name} bad response: ${res.text}`);
  mark(name, { status: res.status });
  return res;
}
async function cleanup() {
  const residue = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (name.includes(run)) residue.push(p);
      else if (fs.statSync(p).isDirectory()) walk(p);
    }
  }
  walk(dbRoot);
  for (const p of residue.sort((a, b) => b.length - a.length)) {
    if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true, force: true }); report.cleanup.push(p); }
  }
}
try {
  const key = await apiKey();
  await must('create profile alias', req('/api/social/aliases', { method: 'POST', key, data: { aliasName: 'UI Profile', inputId: aliasId, description: run } }));
  await must('create viewer alias', req('/api/social/aliases', { method: 'POST', key, data: { aliasName: 'UI Viewer', inputId: viewerAlias, description: run } }));
  await must('create heichel', req(`/api/social/alias/${aliasId}/heichelos`, { method: 'POST', key, data: { aliasId, inputId: heichelId, heichelId, name: run, heichelName: run, description: run, isPublic: 'yes' } }));
  await must('create series', req(`/api/social/heichelos/${heichelId}/addNewSeries`, { method: 'POST', key, data: { aliasId, inputId: seriesId, seriesId, seriesName: run, title: run, parentSeriesId: 'root', description: run } }));
  await must('create post', req(`/api/social/content/heichelos/${heichelId}/posts`, { method: 'POST', key, data: { aliasId, postId, title: run, content: `${run} content`, seriesId, sections: JSON.stringify([{ id: `${run}_section`, title: run, content: run }]) } }));
  await must('create comment', req(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, { method: 'POST', key, data: { aliasId, seriesId, content: `${run} comment`, dayuh: JSON.stringify({ verseSection: 'root', run }) } }));
  await must('bulk history write', req('/api/social/bulk', { method: 'POST', data: { ops: JSON.stringify([{ action: 'recordHistory', aliasId, data: { type: 'post', id: postId, postId, seriesId, heichelId, title: run } }]) } }), r => r.json.ok);
  await must('viewer follows profile', req(`/api/social/follows/${viewerAlias}`, { method: 'POST', data: { type: 'alias', id: aliasId } }), r => r.json.ok);
  await must('profile aggregate has social data', req(`/api/social/profiles/${aliasId}`), r => r.json.ok && r.json.data.posts.some(p => p.postId === postId) && Array.isArray(r.json.data.history));
  await must('followers endpoint includes viewer', req(`/api/social/followers/alias/${aliasId}`), r => r.json.ok && r.json.data.includes(viewerAlias));
  await must('following endpoint includes profile', req(`/api/social/follows/${viewerAlias}`), r => r.json.ok && r.json.data.some(x => x.id === aliasId));
  await must('recommendations endpoint works', req(`/api/social/recommendations/${aliasId}?limit=6`), r => r.json.ok && Array.isArray(r.json.data));
  await must('graph endpoint has nodes', req(`/api/social/profiles/${aliasId}/graph?limit=12`), r => r.json.ok && r.json.data.nodes.length > 0);
  await must('activity endpoint has activity', req(`/api/social/profiles/${aliasId}/activity?limit=10`), r => r.json.ok && r.json.data.length > 0);
  await must('history endpoint has record', req(`/api/social/profiles/${aliasId}/history?limit=5`), r => r.json.ok && r.json.data.some(x => x.id === postId));
  await must('public profile activity hash loads', req(`/@${aliasId}#activity`), r => r.text.includes('public-profile-root') || r.text.includes('profile'));
  await must('public profile graph hash loads', req(`/@${aliasId}#graph`), r => r.text.includes('public-profile-root') || r.text.includes('profile'));
  await must('profile CSS entry loads', req('/style/social/profile/index.css?v=ui-smoke'), r => r.text.includes('profile CSS entry'));
  await must('cleanup heichel API', req(`/api/social/alias/${aliasId}/heichelos/${heichelId}`, { method: 'DELETE', key, data: { aliasId } }));
  await cleanup();
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.error = String(error.stack || error);
  await cleanup().catch(() => {});
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
