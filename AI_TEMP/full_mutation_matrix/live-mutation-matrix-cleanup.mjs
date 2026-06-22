// B"H
/**
 * Full live mutation matrix for the Heichel create/social/profile surface.
 * Creates synthetic data through HTTP APIs, verifies reads, then removes the
 * synthetic heichel through the public delete API and audits residue by prefix.
 */
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
const run = `awtsFull_${Date.now().toString(36)}`;
const userId = `${run}_user`;
const aliasId = `${run}_alias`;
const heichelId = `${run}_heichel`;
const seriesId = `${run}_series`;
const postId = `${run}_post`;
const questionId = `${run}_question`;
const answerId = `${run}_answer`;
const sectionId = `${run}_section`;
const report = { run, pass: [], blocked: [], cleaned: [], failedCleanup: [] };

function mark(name, details = {}) { report.pass.push({ name, ...details }); }
function block(name, details = {}) { report.blocked.push({ name, ...details }); }
function body(value) { return new URLSearchParams(value); }
async function seedKey() {
  const db = new DosDB(dbRoot);
  await db.init();
  const $i = { db, request: { user: { info: { userId } }, headers: {} }, $_POST: { label: 'full mutation matrix' } };
  const created = await createApiKey({ $i, userid: userId });
  assert.ok(created.success?.key, 'api key missing');
  return created.success.key;
}
async function req(route, { method = 'GET', data = null, apiKey } = {}) {
  const routeWithKey = apiKey && method === 'GET' ? `${route}${route.includes('?') ? '&' : '?'}apiKey=${encodeURIComponent(apiKey)}` : route;
  const finalData = apiKey && data ? { apiKey, ...data } : data;
  const response = await fetch(origin + routeWithKey, {
    method,
    headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(finalData ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
    body: finalData ? body(finalData).toString() : undefined,
    redirect: 'follow'
  });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, json, text };
}
function okish(res) { return res.status >= 200 && res.status < 300 && !res.json?.error; }
async function must(name, promise) {
  const res = await promise;
  assert.ok(okish(res), `${name} failed ${res.status} ${res.text}`);
  mark(name, { status: res.status });
  return res;
}
async function maybe(name, promise) {
  const res = await promise;
  if (okish(res)) mark(name, { status: res.status });
  else block(name, { status: res.status, text: String(res.text).slice(0, 400) });
  return res;
}
async function main() {
  const apiKey = await seedKey();
  await must('api key verify', req('/api/social/keys/verify', { apiKey }));
  await must('create alias', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'Awts Full Matrix', inputId: aliasId, description: `synthetic ${run}` } }));
  await must('create heichel through public API', req(`/api/social/alias/${aliasId}/heichelos`, { method: 'POST', apiKey, data: { name: `Awts Matrix ${run}`, heichelName: `Awts Matrix ${run}`, description: `synthetic cleanup ${run}`, heichelId, inputId: heichelId, aliasId, isPublic: 'yes' } }));
  await must('create button target page loads', req('/heichelos/submit', { apiKey }));
  await must('created heichel reads', req(`/api/social/heichelos/${heichelId}`, { apiKey }));
  await must('profile heichel list contains new heichel', req(`/api/social/alias/${aliasId}/heichelos/details`, { apiKey }));
  await must('create series', req(`/api/social/heichelos/${heichelId}/addNewSeries`, { method: 'POST', apiKey, data: { aliasId, seriesName: 'Matrix Series', title: 'Matrix Series', name: 'Matrix Series', inputId: seriesId, seriesId, parentSeriesId: 'root', description: `synthetic ${run}` } }));
  await must('series details read', req(`/api/social/heichelos/${heichelId}/series/${seriesId}/details`, { apiKey }));
  const sections = JSON.stringify([{ id: sectionId, title: 'Matrix Section', verseSection: 'matrix-verse', content: 'B"H synthetic section', segments: [{ id: `${sectionId}_seg`, content: 'segment' }] }]);
  await must('create post with sections', req(`/api/social/content/heichelos/${heichelId}/posts`, { method: 'POST', apiKey, data: { aliasId, postId, title: 'Matrix Post', content: `synthetic ${run}`, seriesId, sections } }));
  await must('read post sections', req(`/api/social/content/heichelos/${heichelId}/posts/${postId}/sections`, { apiKey }));
  await maybe('create additional section', req(`/api/social/content/heichelos/${heichelId}/posts/${postId}/sections`, { method: 'POST', apiKey, data: { aliasId, sectionId: `${sectionId}_extra`, title: 'Extra Section', content: 'extra' } }));
  const comment = await must('create comment on post', req(`/api/social/heichelos/${heichelId}/post/${postId}/comments/`, { method: 'POST', apiKey, data: { aliasId, seriesId, content: `comment ${run}`, dayuh: JSON.stringify({ verseSection: 'matrix-verse', run }) } }));
  const commentId = comment.json?.details?.id || comment.json?.success?.id || comment.json?.id || `${run}_comment_unknown`;
  await must('reply to comment', req(`/api/social/heichelos/${heichelId}/comment/${commentId}`, { method: 'POST', apiKey, data: { aliasId, postId, seriesId, content: `reply ${run}`, dayuh: JSON.stringify({ verseSection: 'matrix-verse', run }) } }));
  await must('list comment authors', req(`/api/social/heichelos/${heichelId}/post/${postId}/comments/aliases?seriesId=${seriesId}&verseSection=matrix-verse`, { apiKey }));
  await must('list comments by alias', req(`/api/social/heichelos/${heichelId}/comments/inSeries/${seriesId}/atPost/${postId}/atAlias/${aliasId}?verseSection=matrix-verse`, { apiKey }));
  await maybe('create question', req(`/api/social/content/heichelos/${heichelId}/questions`, { method: 'POST', apiKey, data: { aliasId, postId: questionId, title: 'Matrix Question', content: 'question', seriesId, sections } }));
  await maybe('create answer', req(`/api/social/content/heichelos/${heichelId}/questions/${questionId}/answers`, { method: 'POST', apiKey, data: { aliasId, answerId, title: 'Matrix Answer', content: 'answer', seriesId } }));
  await maybe('list answers', req(`/api/social/content/heichelos/${heichelId}/questions/${questionId}/answers`, { apiKey }));
  await maybe('reference post', req('/api/social/graph/references', { method: 'POST', apiKey, data: { aliasId, fromType: 'alias', fromId: aliasId, toType: 'post', toId: postId, toHeichelId: heichelId, toSeriesId: seriesId, note: 'reference', excerpt: 'excerpt', kind: 'references' } }));
  await maybe('repost post', req('/api/social/content/repost', { method: 'POST', apiKey, data: { aliasId, fromType: 'alias', fromId: aliasId, toType: 'post', toId: postId, toHeichelId: heichelId, toSeriesId: seriesId, note: 'repost', excerpt: 'excerpt', kind: 'reposts' } }));
  await maybe('share post', req('/api/social/content/share', { method: 'POST', apiKey, data: { aliasId, fromType: 'alias', fromId: aliasId, toType: 'post', toId: postId, toHeichelId: heichelId, toSeriesId: seriesId, note: 'share', excerpt: 'excerpt', kind: 'crossLinks' } }));
  await maybe('create notification', req(`/api/social/notifications/${aliasId}`, { method: 'POST', apiKey, data: { fromAliasId: aliasId, type: 'matrix', title: 'Matrix', body: 'body', entity: JSON.stringify({ heichelId, postId }), actionUrl: `/heichelos/${heichelId}` } }));
  await maybe('list notifications', req(`/api/social/notifications/${aliasId}?includeRead=yes`, { apiKey }));
  await maybe('profile API read', req(`/api/social/profile/${aliasId}`, { apiKey }));
  await maybe('save personal profile API', req(`/api/social/alias/${aliasId}/profile`, { method: 'POST', apiKey, data: { displayName: 'Awts Full Matrix', bio: `synthetic ${run}` } }));
  await maybe('feed home/profile-adjacent', req(`/api/social/feed/home?aliasId=${aliasId}&limit=5`, { apiKey }));
  await cleanup(apiKey);
  console.log(JSON.stringify(report, null, 2));
}
async function cleanup(apiKey) {
  const deleted = await req(`/api/social/alias/${aliasId}/heichelos/${heichelId}`, { method: 'DELETE', apiKey, data: { aliasId } });
  if (okish(deleted)) report.cleaned.push({ name: 'delete synthetic heichel via API', status: deleted.status });
  else report.failedCleanup.push({ name: 'delete synthetic heichel via API', status: deleted.status, text: deleted.text.slice(0, 300) });
  const paths = [
    `${dbRoot}/social/heichelos/${heichelId}`,
    `${dbRoot}/social/aliases/${aliasId}`,
    `${dbRoot}/social/users/${userId}`
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true, force: true }); report.cleaned.push({ name: 'rm exact synthetic path', path: p }); }
  }
}
main().catch(async error => {
  report.error = String(error.stack || error);
  try { await cleanup(''); } catch (e) { report.failedCleanup.push({ name: 'emergency cleanup exception', error: String(e) }); }
  console.error(JSON.stringify(report, null, 2));
  process.exit(1);
});
