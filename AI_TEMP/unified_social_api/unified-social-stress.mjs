// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../geelooy/api/social/helper/apiKeys.js');
const origin = 'http://127.0.0.1:8080';
const dbRoot = path.resolve(process.cwd(), '../../dayuhChadash');
const run = `awtsUnified_${Date.now().toString(36)}`;
const userId = `${run}_user`;
const aliasId = `${run}_alias`;
const targetAlias = `${run}_target`;
const heichelId = `${run}_heichel`;
const seriesId = `${run}_series`;
const postId = `${run}_post`;
const report = { run, pass: [], cleanup: [] };
function mark(name, details = {}) { report.pass.push({ name, ...details }); }
async function key() {
  const db = new DosDB(dbRoot); await db.init();
  const made = await createApiKey({ $i: { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'unified social stress' } }, userid: userId });
  return made.success.key;
}
async function req(route, { method = 'GET', data = null, apiKey = '' } = {}) {
  const finalData = apiKey && data ? { apiKey, ...data } : data;
  const response = await fetch(origin + route, {
    method,
    headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalData ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
    body: finalData ? new URLSearchParams(finalData).toString() : undefined,
    redirect: 'follow'
  });
  const text = await response.text();
  let json; try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 220) }; }
  return { status: response.status, json, text };
}
async function must(name, promise, check = () => true) {
  const result = await promise;
  assert.ok(result.status >= 200 && result.status < 300, `${name} http ${result.status} ${result.text}`);
  assert.ok(check(result), `${name} bad body ${result.text}`);
  mark(name, { status: result.status });
  return result;
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
  const apiKey = await key();
  await must('create alias', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'Unified Alias', inputId: aliasId, description: run } }));
  await must('create target alias', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'Unified Target', inputId: targetAlias, description: run } }));
  await must('create heichel', req(`/api/social/alias/${aliasId}/heichelos`, { method: 'POST', apiKey, data: { aliasId, inputId: heichelId, heichelId, name: run, heichelName: run, description: run, isPublic: 'yes' } }));
  await must('create series', req(`/api/social/heichelos/${heichelId}/addNewSeries`, { method: 'POST', apiKey, data: { aliasId, inputId: seriesId, seriesId, seriesName: run, title: run, parentSeriesId: 'root', description: run } }));
  await must('create post', req(`/api/social/content/heichelos/${heichelId}/posts`, { method: 'POST', apiKey, data: { aliasId, postId, title: run, content: `${run} search body`, seriesId, sections: JSON.stringify([{ id: `${run}_section`, title: run, content: run }]) } }));
  await must('create comment', req(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, { method: 'POST', apiKey, data: { aliasId, seriesId, content: `${run} comment`, dayuh: JSON.stringify({ verseSection: 'root', run }) } }));
  await must('canonical meta', req('/api/social/meta'), r => r.json.ok && r.json.data.canonicalNamespace === '/api/social');
  await must('canonical openapi', req('/api/social/openapi.json'), r => r.json.ok && r.json.data.servers[0].url === '/api/social');
  await must('canonical profile aggregate', req(`/api/social/profiles/${aliasId}`), r => r.json.ok && r.json.data.posts.some(p => p.postId === postId));
  await must('canonical batch', req(`/api/social/profiles/batch?aliases=${aliasId},${targetAlias}&limit=1`), r => r.json.ok && r.json.meta.pageInfo.limit === 1);
  await must('canonical search', req(`/api/social/search?aliases=${aliasId}&q=${run}&limit=5`), r => r.json.ok && r.json.data.length >= 2);
  await must('canonical feed posts filter', req(`/api/social/feed?aliases=${aliasId}&kinds=post&limit=5`), r => r.json.ok && r.json.data.every(x => x.kind === 'post'));
  await must('canonical feed comments filter', req(`/api/social/feed?aliases=${aliasId}&kinds=comment&limit=5`), r => r.json.ok && r.json.data.every(x => x.kind === 'comment'));
  await must('canonical trending', req(`/api/social/trending?aliases=${aliasId}&limit=5`), r => r.json.ok && Array.isArray(r.json.data));
  await must('canonical recommendations', req(`/api/social/recommendations/${aliasId}?limit=5`), r => r.json.ok && Array.isArray(r.json.data));
  await must('canonical analytics', req(`/api/social/profiles/${aliasId}/analytics`), r => r.json.ok && r.json.data.historyCount >= 0);
  await must('canonical graph', req(`/api/social/profiles/${aliasId}/graph?limit=5`), r => r.json.ok && Array.isArray(r.json.data.nodes));
  await must('canonical heichel discovery precedence', req(`/api/social/heichelos/discover?q=${run}&limit=5`), r => r.json.ok && r.json.data.some(h => h.id === heichelId));
  await must('canonical follow alias', req(`/api/social/follows/${aliasId}`, { method: 'POST', data: { type: 'alias', id: targetAlias } }), r => r.json.ok);
  await must('canonical list follows', req(`/api/social/follows/${aliasId}`), r => r.json.ok && r.json.data.some(x => x.id === targetAlias));
  await must('canonical list followers', req(`/api/social/followers/alias/${targetAlias}`), r => r.json.ok && r.json.data.includes(aliasId));
  await must('canonical unfollow alias', req(`/api/social/follows/${aliasId}`, { method: 'DELETE', data: { type: 'alias', id: targetAlias } }), r => r.json.ok);
  await must('canonical bulk history writes', req('/api/social/bulk', { method: 'POST', data: { ops: JSON.stringify([{ action: 'recordHistory', aliasId, data: { type: 'post', id: postId, postId, seriesId, heichelId, title: run } }, { action: 'recordHistory', aliasId, data: { type: 'heichel', id: heichelId, heichelId, title: run } }]) } }), r => r.json.ok && r.json.data.length === 2);
  await must('canonical history paginated', req(`/api/social/profiles/${aliasId}/history?limit=1`), r => r.json.ok && r.json.meta.pageInfo.limit === 1 && r.json.meta.pageInfo.hasMore === true);
  await must('canonical events', req(`/api/social/events?aliases=${aliasId}&limit=3`), r => r.json.ok && Array.isArray(r.json.data.events));
  await must('legacy profile meta still works', req('/api/social/profile/meta'), r => r.json.ok && r.json.data.canonicalNamespace === '/api/social');
  await must('v2 social is gone', req('/api/v2/social/meta'), r => r.json?.error || r.json?.ok === false || r.status >= 400);
  await must('old heichel read still works', req(`/api/social/heichelos/${heichelId}`), r => r.status === 200);
  await must('cleanup heichel api', req(`/api/social/alias/${aliasId}/heichelos/${heichelId}`, { method: 'DELETE', apiKey, data: { aliasId } }));
  await cleanup();
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.error = String(error.stack || error);
  await cleanup().catch(() => {});
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
}
