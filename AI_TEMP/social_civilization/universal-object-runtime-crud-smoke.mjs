// B"H
const base = process.env.AWTSMOOS_BASE || 'http://127.0.0.1:8080';
const runId = `uol_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const objectId = `${runId}_file`;
const adapterId = `${runId}_post`;
const checks = [];
function assert(ok, label, detail = {}) { if (!ok) { const e = new Error(label); e.detail = detail; throw e; } checks.push(label); }
async function req(path, options = {}) {
  const res = await fetch(base + path, options);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json, text };
}
function form(fields) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) body.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  return { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body };
}
async function tombstone(type, id) { await req(`/api/social/objects/${type}/${id}?reason=runtime-smoke-cleanup`, { method: 'DELETE' }).catch(() => null); }
try {
  await tombstone('file', objectId);
  await tombstone('post', adapterId);
  const create = await req('/api/social/objects', form({
    type: 'file', id: objectId, title: 'Universal Object Runtime File', summary: runId,
    creator: { type: 'alias', id: `${runId}_alias` }, tags: ['runtime', 'object-layer'],
    relationships: [{ type: 'workspace', id: `${runId}_workspace`, label: 'Runtime Workspace' }],
    metadata: { path: `/tmp/${objectId}.js` }
  }));
  assert(create.status === 200 && create.json?.success?.id === objectId, 'createObject', create);
  const get = await req(`/api/social/objects/file/${objectId}`);
  assert(get.json?.success?.title === 'Universal Object Runtime File', 'getObject', get);
  const search = await req(`/api/social/objects/search?q=${runId}`);
  assert(search.json?.success?.some(o => o.id === objectId), 'searchObject', search);
  const card = await req(`/api/social/objects/file/${objectId}/card`);
  assert(card.json?.success?.semantic === 'creation', 'objectCard', card);
  const rel = await req(`/api/social/objects/file/${objectId}/relationships`);
  assert(rel.json?.success?.explicit?.some(r => r.type === 'workspace'), 'objectRelationships', rel);
  const timeline = await req(`/api/social/objects/file/${objectId}/timeline`);
  assert(Array.isArray(timeline.json?.success) && timeline.json.success.length >= 1, 'objectTimeline', timeline);
  const inspect = await req(`/api/social/objects/file/${objectId}/inspect`);
  assert(inspect.json?.success?.health?.level, 'objectInspectHealth', inspect);
  const adapted = await req('/api/social/objects/adapt/post', form({ id: adapterId, title: 'Adapted runtime post', heichelId: runId, aliasId: `${runId}_alias`, content: runId }));
  assert(adapted.json?.success?.type === 'post' && adapted.json.success.id === adapterId, 'adaptPostObject', adapted);
  const del = await req(`/api/social/objects/file/${objectId}?reason=runtime-smoke-cleanup`, { method: 'DELETE' });
  assert(del.json?.success?.lifecycle === 'deleted', 'deleteTombstone', del);
  const gone = await req(`/api/social/objects/file/${objectId}`);
  assert(gone.json?.error?.code === 'OBJECT_NOT_FOUND', 'deletedObjectHidden', gone);
  await tombstone('post', adapterId);
  const postGone = await req(`/api/social/objects/search?q=${adapterId}`);
  assert(!(postGone.json?.success || []).some(o => o.id === adapterId), 'adapterObjectTombstoned', postGone);
  const v2 = await req('/api/v2/social/objects/types');
  assert(v2.json?.error?.code === 'INVALID_ROUTE', 'v2StillInvalid', v2);
  console.log(JSON.stringify({ pass: true, runId, checks }, null, 2));
} catch (error) {
  await tombstone('file', objectId);
  await tombstone('post', adapterId);
  console.error(JSON.stringify({ pass: false, runId, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
