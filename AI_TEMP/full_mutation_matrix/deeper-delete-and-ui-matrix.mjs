// B"H
/**
 * Chapter 416: The second matrix tests the gates that erase, govern, and render.
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
const run = `awtsDeep_${Date.now().toString(36)}`;
const userId = `${run}_user`;
const aliasId = `${run}_alias`;
const editorAlias = `${run}_editor`;
const heichelId = `${run}_heichel`;
const seriesId = `${run}_series`;
const postId = `${run}_post`;
const report = { run, pass: [], blocked: [], cleaned: [], failedCleanup: [] };

const mark = (name, extra = {}) => report.pass.push({ name, ...extra });
const block = (name, extra = {}) => report.blocked.push({ name, ...extra });
const isOk = res => res.status >= 200 && res.status < 300 && !res.json?.error;
async function key() {
  const db = new DosDB(dbRoot); await db.init();
  const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'deep matrix' } };
  const made = await createApiKey({ $i, userid: userId });
  assert.ok(made.success?.key);
  return made.success.key;
}
async function req(route, { method = 'GET', data = null, apiKey } = {}) {
  const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalData = apiKey && data ? { apiKey, ...data } : data;
  const response = await fetch(origin + routeWithKey, {
    method,
    headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalData ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
    body: finalData ? new URLSearchParams(finalData).toString() : undefined,
    redirect: 'follow'
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 300) }; }
  return { status: response.status, json, text };
}
async function must(name, p) {
  const res = await p;
  assert.ok(isOk(res), `${name} ${res.status} ${res.text}`);
  mark(name, { status: res.status });
  return res;
}
async function maybe(name, p) {
  const res = await p;
  if (isOk(res)) mark(name, { status: res.status });
  else block(name, { status: res.status, text: String(res.text).slice(0, 350) });
  return res;
}
async function main() {
  const apiKey = await key();
  await must('verify api key', req('/api/social/keys/verify', { apiKey }));
  await must('create owner alias', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'Deep Owner', inputId: aliasId, description: run } }));
  await maybe('create editor alias', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'Deep Editor', inputId: editorAlias, description: run } }));
  await must('create disposable heichel', req(`/api/social/alias/${aliasId}/heichelos`, { method: 'POST', apiKey, data: { name: run, heichelName: run, description: run, heichelId, inputId: heichelId, aliasId, isPublic: 'yes' } }));
  await maybe('heichel page renders', req(`/heichelos/${heichelId}?view=series`, { apiKey }));
  await maybe('ikar page renders still', req('/heichelos/ikar?view=series', { apiKey }));
  await maybe('profile page renders', req(`/@${aliasId}`, { apiKey }));
  await maybe('profile route renders', req('/profile', { apiKey }));
  await maybe('inbox route renders', req('/email', { apiKey }));
  await maybe('manage heichelos route renders', req(`/heichelos/manage-alias-heichelos?alias=${aliasId}`, { apiKey }));
  await maybe('get editors', req(`/api/social/heichelos/${heichelId}/editors`, { apiKey }));
  await maybe('add editor', req(`/api/social/heichelos/${heichelId}/editors`, { method: 'POST', apiKey, data: { aliasId, editorAliasId: editorAlias } }));
  await maybe('remove editor', req(`/api/social/heichelos/${heichelId}/editors`, { method: 'DELETE', apiKey, data: { aliasId, editorAliasId: editorAlias } }));
  await maybe('get owner role list', req(`/api/social/heichelos/${heichelId}/roles/owners`, { apiKey }));
  await maybe('submission settings get', req(`/api/social/heichelos/${heichelId}/settings/submissions`, { apiKey }));
  await maybe('submission settings update', req(`/api/social/heichelos/${heichelId}/settings/submissions`, { method: 'POST', apiKey, data: { aliasId, settings: JSON.stringify({ allowPublicSubmissions: true, run }) } }));
  await must('create series for delete test', req(`/api/social/heichelos/${heichelId}/addNewSeries`, { method: 'POST', apiKey, data: { aliasId, inputId: seriesId, seriesId, seriesName: run, title: run, parentSeriesId: 'root', description: run } }));
  const sections = JSON.stringify([{ id: `${run}_section`, title: run, verseSection: 'deep', content: run }]);
  await must('create post for delete test', req(`/api/social/content/heichelos/${heichelId}/posts`, { method: 'POST', apiKey, data: { aliasId, postId, title: run, content: run, seriesId, sections } }));
  const comment = await must('create comment for delete test', req(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, { method: 'POST', apiKey, data: { aliasId, seriesId, content: run, dayuh: JSON.stringify({ verseSection: 'deep', run }) } }));
  const commentId = comment.json?.details?.id || comment.json?.id || comment.json?.success?.id || '';
  await maybe('delete comment endpoint', req(`/api/social/heichelos/${heichelId}/comment/${commentId}`, { method: 'DELETE', apiKey, data: { aliasId, parentType: 'post', parentId: postId, postId, seriesId, verseSection: 'deep' } }));
  await maybe('delete post endpoint', req(`/api/social/heichelos/${heichelId}/series/${seriesId}/post/${postId}`, { method: 'DELETE', apiKey, data: { aliasId } }));
  await maybe('delete series endpoint', req(`/api/social/heichelos/${heichelId}/series/root/deleteSubSeries/${seriesId}`, { method: 'DELETE', apiKey, data: { aliasId } }));
  const note = await maybe('create notification for read test', req(`/api/social/notifications/${aliasId}`, { method: 'POST', apiKey, data: { fromAliasId: aliasId, type: 'deep', title: run, body: run, entity: JSON.stringify({ run }), actionUrl: '/' } }));
  const notificationId = note.json?.success?.id || note.json?.details?.id || note.json?.id || '';
  if (notificationId) await maybe('mark notification read', req(`/api/social/notifications/${aliasId}/${notificationId}/read`, { method: 'POST', apiKey, data: { aliasId, notificationId } }));
  else block('mark notification read', { text: 'notification id not returned' });
  await cleanup(apiKey);
  console.log(JSON.stringify(report, null, 2));
}
async function cleanup(apiKey) {
  await maybe('delete disposable heichel cleanup', req(`/api/social/alias/${aliasId}/heichelos/${heichelId}`, { method: 'DELETE', apiKey, data: { aliasId } }));
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
  for (const p of residue.sort((a,b) => b.length - a.length)) {
    if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true, force: true }); report.cleaned.push({ path: p }); }
  }
}
main().catch(async error => {
  report.error = String(error.stack || error);
  try { await cleanup(''); } catch (e) { report.failedCleanup.push({ error: String(e) }); }
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
});
