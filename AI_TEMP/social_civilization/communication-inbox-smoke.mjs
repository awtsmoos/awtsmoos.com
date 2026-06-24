// B"H
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.AWTSMOOS_BASE || 'http://localhost:8080';
const dbRoot = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const runId = `inbox_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const aliasId = `${runId}_alias`;
const threadId = `${runId}_thread`;
const itemId = `${runId}_item`;
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
  const root = path.join(dbRoot, 'social', 'communicationInbox');
  await fs.rm(path.join(root, 'byAlias', aliasId), { recursive: true, force: true });
  await fs.rm(path.join(root, 'byThread', aliasId), { recursive: true, force: true });
  await fs.rm(path.join(root, 'readState', aliasId), { recursive: true, force: true });
}

async function scanResidue() {
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
  await walk(path.join(dbRoot, 'social', 'communicationInbox'));
  return [...new Set(hits)];
}

try {
  await removeResidue();

  const create = await request(`/api/social/communications/${aliasId}/inbox`, form({
    id: itemId, threadId, kind: 'chat', title: 'Inbox OS smoke', body: `Hello ${runId}`,
    fromAliasId: `${runId}_sender`, entityType: 'virtual-os', entityId: runId,
    actionUrl: `/os?inbox=${encodeURIComponent(aliasId)}`
  }));
  assert(create.status === 200 && create.json?.success?.id === itemId, 'createInboxItem', create);

  const list = await request(`/api/social/communications/${aliasId}/inbox`);
  assert(list.json?.success?.some(item => item.id === itemId && item.body.includes(runId)), 'listInbox', list);

  const unread = await request(`/api/social/communications/${aliasId}/inbox/unread`);
  assert(unread.json?.success?.count === 1, 'unreadCountOne', unread);

  const thread = await request(`/api/social/communications/${aliasId}/threads/${threadId}`);
  assert(thread.json?.success?.some(item => item.id === itemId), 'threadIncludesItem', thread);

  const overview = await request(`/api/social/communications/${aliasId}/overview`);
  assert(overview.json?.success?.inbox?.unread === 1, 'overviewInboxUnread', overview);
  assert(overview.json?.success?.inbox?.url?.includes('/inbox'), 'overviewInboxUrls', overview);

  const read = await request(`/api/social/communications/${aliasId}/inbox/${itemId}/read`, { method: 'POST' });
  assert(read.json?.success?.readAt > 0, 'markItemRead', read);

  const unreadAfter = await request(`/api/social/communications/${aliasId}/inbox/unread`);
  assert(unreadAfter.json?.success?.count === 0, 'unreadCountZero', unreadAfter);

  const second = await request(`/api/social/communications/${aliasId}/inbox`, form({
    id: `${itemId}_second`, threadId, kind: 'mail', title: 'Thread second', body: `Second ${runId}`
  }));
  assert(second.json?.success?.id === `${itemId}_second`, 'createSecondThreadItem', second);

  const threadRead = await request(`/api/social/communications/${aliasId}/threads/${threadId}/read`, { method: 'POST' });
  assert(threadRead.json?.success?.marked >= 1, 'markThreadRead', threadRead);

  const bad = await request(`/api/social/communications/${aliasId}/inbox/${runId}_missing/read`, { method: 'POST' });
  assert(bad.json?.error?.code === 'INBOX_ITEM_NOT_FOUND', 'missingItemGuard', bad);

  const v2 = await request(`/api/v2/social/communications/${aliasId}/inbox`);
  assert(v2.json?.error?.code === 'INVALID_ROUTE', 'v2StillGone', v2);

  await removeResidue();
  const residue = await scanResidue();
  assert(residue.length === 0, 'residueClean', { residue });

  console.log(JSON.stringify({ pass: true, runId, checks }, null, 2));
} catch (error) {
  await removeResidue().catch(() => {});
  console.error(JSON.stringify({ pass: false, runId, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
