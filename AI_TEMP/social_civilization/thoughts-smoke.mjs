// B"H
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.AWTSMOOS_BASE || 'http://localhost:8080';
const dbRoot = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const runId = `thought_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const aliasId = `${runId}_alias`;
const reactorId = `${runId}_reactor`;
const heichelId = `${runId}_heichel`;
const entityType = 'post';
const entityId = `${runId}_entity`;
const rootId = `${runId}_root`;
const replyId = `${runId}_reply`;
const checks = [];

function assert(condition, label, detail = {}) {
  if (!condition) { const error = new Error(label); error.detail = detail; throw error; }
  checks.push(label);
}

async function request(url, options = {}) {
  const res = await fetch(`${base}${url}`, options);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json, text };
}

function form(fields, method = 'POST') {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) body.set(key, String(value));
  return { method, headers: { 'content-type': 'application/x-www-form-urlencoded' }, body };
}

async function removeResidue() {
  const r = path.join(dbRoot, 'social', 'thoughts');
  await Promise.all([
    fs.rm(path.join(r, 'byId', rootId), { recursive: true, force: true }),
    fs.rm(path.join(r, 'byId', replyId), { recursive: true, force: true }),
    fs.rm(path.join(r, 'byEntity', entityType, entityId), { recursive: true, force: true }),
    fs.rm(path.join(r, 'byAlias', aliasId), { recursive: true, force: true }),
    fs.rm(path.join(r, 'byAlias', reactorId), { recursive: true, force: true }),
    fs.rm(path.join(r, 'byHeichel', heichelId), { recursive: true, force: true }),
    fs.rm(path.join(r, 'replies', rootId), { recursive: true, force: true }),
    fs.rm(path.join(r, 'reactions', rootId), { recursive: true, force: true }),
    fs.rm(path.join(r, 'reactions', replyId), { recursive: true, force: true })
  ]);
}

async function scanResidue() {
  const root = path.join(dbRoot, 'social', 'thoughts');
  const hits = [];
  async function walk(dir) {
    let entries = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.name.includes(runId)) hits.push(full);
      if (entry.isDirectory()) await walk(full);
      if (entry.isFile()) {
        const text = await fs.readFile(full, 'utf8').catch(() => '');
        if (text.includes(runId)) hits.push(full);
      }
    }
  }
  await walk(root);
  return [...new Set(hits)];
}

try {
  await removeResidue();
  const create = await request(`/api/social/thoughts/${entityType}/${entityId}`, form({ id: rootId, aliasId, heichelId, body: 'A living thought appears.' }));
  assert(create.status === 200 && create.json?.success?.id === rootId, 'createRoot', create);

  const edit = await request(`/api/social/thoughts/${rootId}`, form({ body: 'A living thought appears, then improves.' }, 'PUT'));
  assert(edit.json?.success?.body?.includes('improves') && edit.json?.success?.editedAt, 'editRoot', edit);

  const reaction = await request(`/api/social/thoughts/${rootId}/reactions`, form({ aliasId: reactorId, kind: 'flame' }));
  assert(reaction.json?.success?.kinds?.flame === 1, 'setReaction', reaction);

  const reactionRead = await request(`/api/social/thoughts/${rootId}/reactions`);
  assert(reactionRead.json?.success?.total === 1, 'getReactions', reactionRead);

  const reply = await request(`/api/social/thoughts/${rootId}/replies`, form({ id: replyId, aliasId, heichelId, body: 'A reply spark answers.' }));
  assert(reply.status === 200 && reply.json?.success?.id === replyId, 'createReply', reply);

  const thread = await request(`/api/social/thoughts/thread/${rootId}`);
  assert(thread.json?.success?.replies?.some(item => item.id === replyId) && thread.json?.success?.reactions?.flame === 1, 'threadRepliesAndReactions', thread);

  const list = await request(`/api/social/thoughts/${entityType}/${entityId}`);
  assert(list.json?.success?.some(item => item.id === rootId), 'listEntity', list);

  const stats = await request(`/api/social/thoughts/${entityType}/${entityId}/stats`);
  assert(stats.json?.success?.thoughts === 2 && stats.json?.success?.replies === 1 && stats.json?.success?.reactions === 1, 'entityStats', stats);

  const feed = await request(`/api/social/thoughts/feed?aliasId=${encodeURIComponent(aliasId)}`);
  assert(feed.json?.success?.some(item => item.id === rootId), 'feedAlias', feed);

  const bad = await request('/api/social/thoughts/feed');
  assert(bad.json?.error?.code === 'MISSING_FILTER', 'missingFilterGuard', bad);

  const v2 = await request('/api/v2/social/meta');
  assert(v2.json?.error?.code === 'INVALID_ROUTE', 'v2StillGone', v2);

  const delRoot = await request(`/api/social/thoughts/${rootId}?recursive=true`, { method: 'DELETE' });
  assert(delRoot.json?.success?.deleted === rootId && delRoot.json?.success?.children?.includes(replyId), 'deleteRecursive', delRoot);

  const after = await request(`/api/social/thoughts/thread/${replyId}`);
  assert(after.json?.error?.code === 'THOUGHT_NOT_FOUND', 'recursiveChildGone', after);

  await removeResidue();
  const residue = await scanResidue();
  assert(residue.length === 0, 'residueClean', { residue });

  console.log(JSON.stringify({ pass: true, runId, checks }, null, 2));
} catch (error) {
  await removeResidue().catch(() => {});
  console.error(JSON.stringify({ pass: false, runId, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
