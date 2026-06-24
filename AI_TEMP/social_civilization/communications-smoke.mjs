// B"H
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.AWTSMOOS_BASE || 'http://localhost:8080';
const dbRoot = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const runId = `comm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const aliasId = `${runId}_alias`;
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
  await fs.rm(path.join(dbRoot, 'social', 'aliases', aliasId, 'notifications'), { recursive: true, force: true });
  await fs.rm(path.join(dbRoot, 'social', 'aliases', aliasId), { recursive: true, force: true });
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
  await walk(path.join(dbRoot, 'social'));
  return [...new Set(hits)];
}

try {
  await removeResidue();
  const create = await request(`/api/social/notifications/${aliasId}`, form({
    fromAliasId: `${runId}_sender`, type: 'chat', title: 'Bridge ping', body: `Hello ${runId}`,
    entity: JSON.stringify({ type: 'chat', id: runId }), actionUrl: `/social?alias=${aliasId}#chat`
  }));
  assert(create.status === 200 && create.json?.success?.id, 'createNotification', create);

  const overview = await request(`/api/social/communications/${aliasId}/overview`);
  assert(overview.status === 200 && overview.json?.success?.aliasId === aliasId, 'overviewAlias', overview);
  assert(overview.json?.success?.notifications?.unread >= 1, 'overviewNotificationUnread', overview);
  assert(overview.json?.success?.notifications?.recent?.some(item => item.body?.includes(runId)), 'overviewRecentNotification', overview);
  assert(overview.json?.success?.live?.profileChannel === `profile:${aliasId}`, 'overviewProfileChannel', overview);
  assert(overview.json?.success?.actions?.chat?.includes('#chat'), 'overviewChatAction', overview);
  assert(overview.json?.success?.mail?.available === false || overview.json?.success?.mail?.available === true, 'overviewMailShape', overview);

  const live = await request(`/api/social/communications/${aliasId}/live-map`);
  assert(live.json?.success?.chatChannel === `chat:${aliasId}`, 'liveMapChat', live);
  assert(live.json?.success?.websocketEvents?.includes('SOCIAL_EVENT'), 'liveMapEvents', live);

  const digest = await request(`/api/social/communications/${aliasId}/notification-digest?limit=5`);
  assert(digest.json?.success?.recent?.length >= 1 && digest.json?.success?.pollUrl?.includes(aliasId), 'notificationDigest', digest);

  const badMethod = await request(`/api/social/communications/${aliasId}/overview`, { method: 'POST' });
  assert(badMethod.json?.error?.code === 'BAD_METHOD', 'badMethodGuard', badMethod);

  const v2 = await request('/api/v2/social/communications/test/overview');
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
