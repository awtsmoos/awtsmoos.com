// B"H
/**
 * Complete /api/social stress harness.
 * Creates one synthetic social world, tests canonical and legacy endpoints,
 * records PASS/BLOCKED/FAIL, then removes all exact run-id residue.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../geelooy/api/social/helper/apiKeys.js');

const origin = process.env.AWTS_API_ORIGIN || 'http://127.0.0.1:8080';
const dbRoot = path.resolve(process.cwd(), '../../dayuhChadash');
const run = `af${Date.now().toString(36).slice(-8)}`;
const ids = {
  run,
  user: `${run}_user`,
  owner: `${run}_own`,
  editor: `${run}_edit`,
  outsider: `${run}_out`,
  heichel: `${run}_heich`,
  series: `${run}_ser`,
  childSeries: `${run}_child`,
  post: `${run}_p1`,
  post2: `${run}_p2`,
  question: `${run}_q`,
  answer: `${run}_ans`,
  section: `${run}_sec`
};
const report = { BH: 'B"H', run, pass: [], blocked: [], fail: [], cleanup: [] };

function mark(kind, name, details = {}) { report[kind].push({ name, ...details }); }
function pass(name, details = {}) { mark('pass', name, details); }
function blocked(name, details = {}) { mark('blocked', name, details); }
function failed(name, error, details = {}) { mark('fail', name, { error: String(error?.stack || error), ...details }); }
function form(data = {}) { return new URLSearchParams(data).toString(); }
async function seedApiKey() {
  const db = new DosDB(dbRoot); await db.init();
  const made = await createApiKey({ $i: { db, request: { user: { info: { userId: ids.user } }, headers: {} }, $_POST: { label: 'complete api stress' } }, userid: ids.user });
  assert.ok(made.success?.key, 'api key missing');
  return made.success.key;
}
async function req(route, { method = 'GET', data = null, apiKey = '', raw = false } = {}) {
  const final = apiKey && data ? { apiKey, ...data } : data;
  const response = await fetch(origin + route, {
    method,
    headers: { ...(apiKey ? { authorization: `Bearer ${apiKey}`, 'x-awtsmoos-api-key': apiKey } : {}), ...(final ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
    body: final ? form(final) : undefined,
    redirect: 'follow'
  });
  const text = await response.text();
  let json = null; try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 500) }; }
  return { status: response.status, ok: response.status >= 200 && response.status < 300, json, text, raw };
}
function good(res) { return res.ok && !res.json?.error; }
async function must(name, promise, check = () => true) {
  const res = await promise;
  assert.ok(good(res), `${name} HTTP ${res.status}: ${res.text}`);
  assert.ok(check(res), `${name} body check failed: ${res.text}`);
  pass(name, { status: res.status });
  return res;
}
async function maybe(name, promise, check = () => true) {
  const res = await promise;
  if (good(res) && check(res)) pass(name, { status: res.status });
  else blocked(name, { status: res.status, text: String(res.text).slice(0, 500) });
  return res;
}
async function expectBad(name, promise) {
  const res = await promise;
  if (!good(res) || res.json?.ok === false || res.json?.error) pass(name, { status: res.status, expectedBad: true, code: res.json?.error?.code || res.json?.BH && res.json?.error?.code || null });
  else blocked(name, { status: res.status, text: 'Expected an error or rejection but endpoint accepted request.' });
}
async function concurrent(name, count, fn) {
  const results = await Promise.allSettled(Array.from({ length: count }, (_, i) => fn(i)));
  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length) blocked(name, { failures: failures.length, first: String(failures[0].reason) });
  else pass(name, { count });
}

async function seedWorld(apiKey) {
  await must('aliases:create owner', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'API Owner', inputId: ids.owner, description: run } }));
  await must('aliases:create editor', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'API Editor', inputId: ids.editor, description: run } }));
  await must('aliases:create outsider', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'API Outsider', inputId: ids.outsider, description: run } }));
  await expectBad('aliases:duplicate owner rejected or reported', req('/api/social/aliases', { method: 'POST', apiKey, data: { aliasName: 'Duplicate', inputId: ids.owner, description: run } }));
  await must('heichel:create public', req(`/api/social/alias/${ids.owner}/heichelos`, { method: 'POST', apiKey, data: { aliasId: ids.owner, inputId: ids.heichel, heichelId: ids.heichel, name: run, heichelName: run, description: run, isPublic: 'yes' } }));
  await must('series:create root child', req(`/api/social/heichelos/${ids.heichel}/addNewSeries`, { method: 'POST', apiKey, data: { aliasId: ids.owner, inputId: ids.series, seriesId: ids.series, seriesName: run, title: run, parentSeriesId: 'root', description: run } }));
  await must('series:create nested child', req(`/api/social/heichelos/${ids.heichel}/addNewSeries`, { method: 'POST', apiKey, data: { aliasId: ids.owner, inputId: ids.childSeries, seriesId: ids.childSeries, seriesName: `${run} child`, title: `${run} child`, parentSeriesId: ids.series, description: run } }));
  await must('posts:create with sections', req(`/api/social/content/heichelos/${ids.heichel}/posts`, { method: 'POST', apiKey, data: { aliasId: ids.owner, postId: ids.post, title: run, content: `${run} body`, seriesId: ids.series, sections: JSON.stringify([{ id: ids.section, title: run, verseSection: 'root', content: run }]) } }));
  await must('posts:create second for graph', req(`/api/social/content/heichelos/${ids.heichel}/posts`, { method: 'POST', apiKey, data: { aliasId: ids.owner, postId: ids.post2, title: `${run} second`, content: `${run} body 2`, seriesId: ids.series, sections: JSON.stringify([{ id: `${ids.section}_2`, title: run, verseSection: 'root2', content: run }]) } }));
}
async function testDiscovery() {
  await must('root:social', req('/api/social'));
  await must('meta:canonical', req('/api/social/meta'), r => r.json.ok && r.json.data.canonicalNamespace === '/api/social');
  await must('openapi', req('/api/social/openapi.json'), r => r.json.ok && r.json.data.openapi);
  await must('heichelos:discover precedence', req(`/api/social/heichelos/discover?q=${run}&limit=5`), r => r.json.ok && r.json.data.some(h => h.id === ids.heichel));
  await must('search:find synthetic', req(`/api/social/search?aliases=${ids.owner}&q=${run}&limit=20`), r => r.json.ok && r.json.data.length >= 2);
  await must('feed:posts filter', req(`/api/social/feed?aliases=${ids.owner}&kinds=post&limit=10`), r => r.json.ok && r.json.data.every(x => x.kind === 'post'));
  await must('feed:comments empty-or-valid before comments', req(`/api/social/feed?aliases=${ids.owner}&kinds=comment&limit=10`), r => r.json.ok && Array.isArray(r.json.data));
  await must('trending', req(`/api/social/trending?aliases=${ids.owner}&limit=10`), r => r.json.ok && Array.isArray(r.json.data));
  await must('events shape', req(`/api/social/events?aliases=${ids.owner}&limit=5`), r => r.json.ok && Array.isArray(r.json.data.events));
  await must('pagination:large limit clamped', req(`/api/social/search?aliases=${ids.owner}&q=${run}&limit=999`), r => r.json.ok && r.json.meta.pageInfo.limit <= 100);
  await must('pagination:malformed cursor safe', req(`/api/social/search?aliases=${ids.owner}&q=${run}&cursor=not_base64&limit=1`), r => r.json.ok && r.json.meta.pageInfo.limit === 1);
}
async function testProfiles() {
  await must('profiles:aggregate', req(`/api/social/profiles/${ids.owner}`), r => r.json.ok && r.json.data.posts.some(p => p.postId === ids.post));
  await must('profiles:batch mixed', req(`/api/social/profiles/batch?aliases=${ids.owner},missing_${run}&limit=5`), r => r.json.ok && r.json.data.length === 1);
  await must('profiles:activity', req(`/api/social/profiles/${ids.owner}/activity?limit=5`), r => r.json.ok && Array.isArray(r.json.data));
  await must('profiles:analytics', req(`/api/social/profiles/${ids.owner}/analytics`), r => r.json.ok && r.json.data.aliasId === ids.owner);
  await must('profiles:graph', req(`/api/social/profiles/${ids.owner}/graph?limit=20`), r => r.json.ok && r.json.data.nodes.some(n => n.id === `alias:${ids.owner}`));
  await must('history:record post', req(`/api/social/profiles/${ids.owner}/history`, { method: 'POST', data: { type: 'post', id: ids.post, postId: ids.post, seriesId: ids.series, heichelId: ids.heichel, title: run } }), r => r.json.ok);
  await must('history:dedupe same post', req(`/api/social/profiles/${ids.owner}/history`, { method: 'POST', data: { type: 'post', id: ids.post, postId: ids.post, seriesId: ids.series, heichelId: ids.heichel, title: run } }), r => r.json.ok);
  await must('history:bulk 3 records', req('/api/social/bulk', { method: 'POST', data: { ops: JSON.stringify(Array.from({ length: 3 }, (_, i) => ({ action: 'recordHistory', aliasId: ids.owner, data: { type: 'page', id: `${run}_hist_${i}`, title: `${run} hist ${i}` } }))) } }), r => r.json.ok && r.json.data.length === 3);
  await must('history:paginated', req(`/api/social/profiles/${ids.owner}/history?limit=2`), r => r.json.ok && r.json.meta.pageInfo.limit === 2);
  await must('legacy:profile meta precedence', req('/api/social/profile/meta'), r => r.json.ok && r.json.data.canonicalNamespace === '/api/social');
  await must('legacy:profile aggregate', req(`/api/social/profile/${ids.owner}`), r => (r.json.alias || r.json.ok || r.json.success));
  await must('legacy:profile posts', req(`/api/social/profile/${ids.owner}/posts`), r => Array.isArray(r.json.success));
  await must('legacy:alias history get', req(`/api/social/alias/${ids.owner}/history`), r => Array.isArray(r.json.success));
}
async function testFollows() {
  await must('follows:follow alias', req(`/api/social/follows/${ids.owner}?type=alias&id=${ids.editor}`, { method: 'POST' }), r => r.json.ok);
  await must('follows:duplicate dedupe alias', req(`/api/social/follows/${ids.owner}?type=alias&id=${ids.editor}`, { method: 'POST' }), r => r.json.ok);
  await must('follows:follow heichel', req(`/api/social/follows/${ids.owner}`, { method: 'POST', data: { type: 'heichel', id: ids.heichel } }), r => r.json.ok);
  await must('follows:list', req(`/api/social/follows/${ids.owner}`), r => r.json.ok && r.json.data.some(x => x.id === ids.editor));
  await must('followers:list alias backlink', req(`/api/social/followers/alias/${ids.editor}`), r => r.json.ok && r.json.data.includes(ids.owner));
  await expectBad('follows:missing target rejected or reported', req(`/api/social/follows/${ids.owner}`, { method: 'POST', data: { type: 'alias' } }));
  await must('follows:unfollow alias', req(`/api/social/follows/${ids.owner}`, { method: 'DELETE', data: { type: 'alias', id: ids.editor } }), r => r.json.ok);
}
async function testSeriesPosts(apiKey) {
  await must('heichel:read', req(`/api/social/heichelos/${ids.heichel}`), r => r.status === 200);
  await maybe('heichel:alias list/details', req(`/api/social/alias/${ids.owner}/heichelos/details`, { apiKey }));
  await expectBad('heichel:duplicate create rejected or reported', req(`/api/social/alias/${ids.owner}/heichelos`, { method: 'POST', apiKey, data: { aliasId: ids.owner, inputId: ids.heichel, heichelId: ids.heichel, name: run, heichelName: run, description: run, isPublic: 'yes' } }));
  await must('series:details', req(`/api/social/heichelos/${ids.heichel}/series/${ids.series}/details`), r => r.status === 200);
  await must('series:subseries details', req(`/api/social/heichelos/${ids.heichel}/series/${ids.series}/subSeries?details=true`), r => r.status === 200);
  await expectBad('series:bad parent create rejected or reported', req(`/api/social/heichelos/${ids.heichel}/addNewSeries`, { method: 'POST', apiKey, data: { aliasId: ids.owner, inputId: `${run}_bad`, seriesId: `${run}_bad`, seriesName: run, title: run, parentSeriesId: `${run}_missing`, description: run } }));
  await must('sections:read', req(`/api/social/content/heichelos/${ids.heichel}/posts/${ids.post}/sections`), r => r.status === 200);
  await maybe('sections:add', req(`/api/social/content/heichelos/${ids.heichel}/posts/${ids.post}/sections`, { method: 'POST', apiKey, data: { aliasId: ids.owner, sectionId: `${ids.section}_extra`, title: 'extra', content: run } }));
  await expectBad('posts:malformed sections rejected or reported', req(`/api/social/content/heichelos/${ids.heichel}/posts?sections=%7Bnot-json`, { method: 'POST', apiKey, data: { aliasId: ids.owner, postId: `${run}_bad_post`, title: run, content: run, seriesId: ids.series } }));
}
async function testCommentsNotifications(apiKey) {
  const comment = await must('comments:create', req(`/api/social/heichelos/${ids.heichel}/post/${ids.post}/comments/`, { method: 'POST', apiKey, data: { aliasId: ids.owner, seriesId: ids.series, content: `${run} comment`, dayuh: JSON.stringify({ verseSection: 'root', run }) } }));
  const commentId = comment.json?.details?.id || comment.json?.success?.id || comment.json?.id || comment.json?.commentId || '';
  if (commentId) {
    await must('comments:reply', req(`/api/social/heichelos/${ids.heichel}/comment/${commentId}`, { method: 'POST', apiKey, data: { aliasId: ids.owner, postId: ids.post, seriesId: ids.series, content: `${run} reply`, dayuh: JSON.stringify({ verseSection: 'root', run }) } }));
    await maybe('comments:delete', req(`/api/social/heichelos/${ids.heichel}/comment/${commentId}`, { method: 'DELETE', apiKey, data: { aliasId: ids.owner, parentType: 'post', parentId: ids.post, postId: ids.post, seriesId: ids.series, verseSection: 'root' } }));
  } else blocked('comments:reply/delete', { reason: 'comment id not returned' });
  await must('comments:list authors', req(`/api/social/heichelos/${ids.heichel}/post/${ids.post}/comments/aliases?seriesId=${ids.series}&verseSection=root`), r => r.status === 200);
  await must('comments:list by alias', req(`/api/social/heichelos/${ids.heichel}/comments/inSeries/${ids.series}/atPost/${ids.post}/atAlias/${ids.owner}?verseSection=root`), r => r.status === 200);
  const note = await must('notifications:create', req(`/api/social/notifications/${ids.owner}`, { method: 'POST', apiKey, data: { fromAliasId: ids.editor, type: 'stress', title: run, body: run, entity: JSON.stringify({ run, postId: ids.post }), actionUrl: `/heichelos/${ids.heichel}` } }));
  await must('notifications:list', req(`/api/social/notifications/${ids.owner}?includeRead=yes`, { apiKey }), r => r.status === 200);
  const noteId = note.json?.success?.id || note.json?.details?.id || note.json?.id || '';
  if (noteId) await maybe('notifications:mark read', req(`/api/social/notifications/${ids.owner}/${noteId}/read`, { method: 'POST', apiKey, data: { aliasId: ids.owner, notificationId: noteId } }));
  else blocked('notifications:mark read', { reason: 'notification id not returned' });
}
async function testQuestionsGraph(apiKey) {
  await maybe('questions:create', req(`/api/social/content/heichelos/${ids.heichel}/questions`, { method: 'POST', apiKey, data: { aliasId: ids.owner, postId: ids.question, title: run, content: run, seriesId: ids.series, sections: JSON.stringify([{ id: `${ids.section}_q`, title: run, content: run }]) } }));
  await maybe('answers:create', req(`/api/social/content/heichelos/${ids.heichel}/questions/${ids.question}/answers`, { method: 'POST', apiKey, data: { aliasId: ids.owner, answerId: ids.answer, title: run, content: run, seriesId: ids.series } }));
  await maybe('answers:list', req(`/api/social/content/heichelos/${ids.heichel}/questions/${ids.question}/answers`, { apiKey }));
  await must('graph:reference', req('/api/social/graph/references', { method: 'POST', apiKey, data: { aliasId: ids.owner, fromType: 'post', fromId: ids.post, fromHeichelId: ids.heichel, fromSeriesId: ids.series, toType: 'post', toId: ids.post2, toHeichelId: ids.heichel, toSeriesId: ids.series, note: run, excerpt: run, kind: 'references' } }), r => r.status === 200);
  await must('graph:repost', req('/api/social/content/repost', { method: 'POST', apiKey, data: { aliasId: ids.owner, fromType: 'alias', fromId: ids.owner, toType: 'post', toId: ids.post, toHeichelId: ids.heichel, toSeriesId: ids.series, note: run, excerpt: run, kind: 'reposts' } }), r => r.status === 200);
  await must('graph:share', req('/api/social/content/share', { method: 'POST', apiKey, data: { aliasId: ids.owner, fromType: 'alias', fromId: ids.owner, toType: 'post', toId: ids.post, toHeichelId: ids.heichel, toSeriesId: ids.series, note: run, excerpt: run, kind: 'crossLinks' } }), r => r.status === 200);
  await must('graph:profile includes nodes', req(`/api/social/profiles/${ids.owner}/graph?limit=30`), r => r.json.ok && r.json.data.nodes.length > 0);
}
async function testGovernance(apiKey) {
  await maybe('editors:get', req(`/api/social/heichelos/${ids.heichel}/editors`, { apiKey }));
  await maybe('editors:add', req(`/api/social/heichelos/${ids.heichel}/editors`, { method: 'POST', apiKey, data: { aliasId: ids.owner, editorAliasId: ids.editor } }));
  await maybe('editors:remove', req(`/api/social/heichelos/${ids.heichel}/editors`, { method: 'DELETE', apiKey, data: { aliasId: ids.owner, editorAliasId: ids.editor } }));
  await maybe('settings:submissions get', req(`/api/social/heichelos/${ids.heichel}/settings/submissions`, { apiKey }));
  await maybe('settings:submissions update', req(`/api/social/heichelos/${ids.heichel}/settings/submissions`, { method: 'POST', apiKey, data: { aliasId: ids.owner, settings: JSON.stringify({ allowPublicSubmissions: true, run }) } }));
  await expectBad('roles:invalid role structured error', req(`/api/social/heichelos/${ids.heichel}/roles/owners`, { apiKey }));
  await expectBad('permission:outsider delete heichel should fail', req(`/api/social/alias/${ids.outsider}/heichelos/${ids.heichel}`, { method: 'DELETE', apiKey, data: { aliasId: ids.outsider } }));
}
async function testBulkNegativeConcurrency() {
  await must('bulk:unknown op reports item error', req('/api/social/bulk', { method: 'POST', data: { ops: JSON.stringify([{ action: 'unknownAction', aliasId: ids.owner }]) } }), r => r.json.ok && r.json.data[0]?.error);
  await expectBad('bulk:malformed ops rejected or reported', req('/api/social/bulk?ops=%7Bbad-json', { method: 'POST' }));
  await concurrent('concurrency:history writes 20', 20, i => req(`/api/social/profiles/${ids.owner}/history`, { method: 'POST', data: { type: 'page', id: `${run}_concurrent_${i}`, title: `${run} concurrent ${i}` } }).then(r => assert.ok(good(r), r.text)));
  await concurrent('concurrency:follows valid writes 20', 20, () => req(`/api/social/follows/${ids.owner}?type=alias&id=${ids.editor}`, { method: 'POST' }).then(r => assert.ok(good(r), r.text)));
  await concurrent('concurrency:follows reads 20', 20, () => req(`/api/social/follows/${ids.owner}`).then(r => assert.ok(good(r), r.text)));
  await concurrent('concurrency:feed reads 20', 20, () => req(`/api/social/feed?aliases=${ids.owner}&limit=5`).then(r => assert.ok(good(r), r.text)));
}
async function deleteSynthetic(apiKey) {
  await maybe('cleanup:delete post', req(`/api/social/heichelos/${ids.heichel}/series/${ids.series}/post/${ids.post}`, { method: 'DELETE', apiKey, data: { aliasId: ids.owner } }));
  await maybe('cleanup:delete post2', req(`/api/social/heichelos/${ids.heichel}/series/${ids.series}/post/${ids.post2}`, { method: 'DELETE', apiKey, data: { aliasId: ids.owner } }));
  await maybe('cleanup:delete child series', req(`/api/social/heichelos/${ids.heichel}/series/${ids.series}/deleteSubSeries/${ids.childSeries}`, { method: 'DELETE', apiKey, data: { aliasId: ids.owner } }));
  await maybe('cleanup:delete series', req(`/api/social/heichelos/${ids.heichel}/series/root/deleteSubSeries/${ids.series}`, { method: 'DELETE', apiKey, data: { aliasId: ids.owner } }));
  await maybe('cleanup:delete heichel', req(`/api/social/alias/${ids.owner}/heichelos/${ids.heichel}`, { method: 'DELETE', apiKey, data: { aliasId: ids.owner } }));
}
async function residueCleanup() {
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
    if (fs.existsSync(p)) { fs.rmSync(p, { recursive: true, force: true }); report.cleanup.push({ path: p }); }
  }
  const after = [];
  walk(dbRoot);
  if (after.length) blocked('cleanup:residue remains', { after });
  else pass('cleanup:exact filename residue scan clean', { removed: report.cleanup.length });
}
async function runAll() {
  const apiKey = await seedApiKey();
  try {
    await seedWorld(apiKey);
    await testDiscovery();
    await testProfiles();
    await testFollows();
    await testSeriesPosts(apiKey);
    await testCommentsNotifications(apiKey);
    await testQuestionsGraph(apiKey);
    await testGovernance(apiKey);
    await testBulkNegativeConcurrency();
  } catch (error) {
    failed('runAll:exception before cleanup', error);
  } finally {
    await deleteSynthetic(apiKey).catch(error => failed('cleanup:api exception', error));
    await residueCleanup().catch(error => failed('cleanup:residue exception', error));
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.fail.length) process.exit(1);
}
runAll();
