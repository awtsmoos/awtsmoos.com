// B"H
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.AWTSMOOS_BASE || 'http://localhost:8080';
const dbRoot = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const aliasId = process.env.AWTSMOOS_LIVING_CARD_ALIAS || 'media_deep_mqpx2sfv_u77sgm9xky_alias';
const runId = `living_card_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const itemId = `${runId}_item`;
const threadId = `${runId}_thread`;
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

function form(fields) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) body.set(key, String(value));
  return { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body };
}

async function rmMaybe(filePath) {
  await fs.rm(filePath, { recursive: true, force: true });
  await fs.rm(`${filePath}.awtsmoosJSON`, { recursive: true, force: true });
}

async function removeResidue() {
  const root = path.join(dbRoot, 'social', 'communicationInbox');
  await rmMaybe(path.join(root, 'byAlias', aliasId, itemId));
  await rmMaybe(path.join(root, 'byThread', aliasId, threadId));
  await rmMaybe(path.join(root, 'readState', aliasId, itemId));
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
    id: itemId, threadId, kind: 'living-card-smoke', title: 'Living card smoke',
    body: runId, fromAliasId: `${runId}_sender`, entityType: 'knowledge-node', entityId: runId
  }));
  assert(create.status === 200 && create.json?.success?.id === itemId, 'createInboxContext', create);

  const card = await request(`/api/social/profiles/${aliasId}/living-card`);
  assert(card.status === 200 && card.json?.success?.aliasId === aliasId, 'livingCardRoute', card);
  assert(card.json?.success?.profile?.username === aliasId, 'livingCardProfile', card);
  assert(card.json?.success?.communications?.inbox?.url?.includes('/communications/'), 'livingCardCommunications', card);
  assert(Array.isArray(card.json?.success?.recentActivity), 'livingCardActivityArray', card);
  assert(card.json?.success?.reputation?.level, 'livingCardReputation', card);

  const v2 = await request(`/api/v2/social/profiles/${aliasId}/living-card`);
  assert(v2.json?.error?.code === 'INVALID_ROUTE', 'v2StillGone', v2);

  await removeResidue();
  const residue = await scanResidue();
  assert(residue.length === 0, 'residueClean', { residue });
  console.log(JSON.stringify({ pass: true, runId, aliasId, checks }, null, 2));
} catch (error) {
  await removeResidue().catch(() => {});
  console.error(JSON.stringify({ pass: false, runId, aliasId, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
