// B"H
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.AWTSMOOS_BASE || 'http://127.0.0.1:8080';
const dbRoot = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const runId = `civ_event_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const aliasId = `${runId}_alias`;
const entityId = `${runId}_file`;
const eventId = `${runId}_event`;
const threadId = `${runId}_thread`;
const inboxId = `civ_${eventId}`;
const checks = [];

function assert(condition, label, detail = {}) {
  if (!condition) { const error = new Error(label); error.detail = detail; throw error; }
  checks.push(label);
}
async function req(url, options = {}) {
  const res = await fetch(`${base}${url}`, options);
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
async function rmMaybe(filePath) {
  await fs.rm(filePath, { recursive: true, force: true });
  await fs.rm(`${filePath}.awtsmoosJSON`, { recursive: true, force: true });
}
async function removeInboxProjection() {
  const root = path.join(dbRoot, 'social', 'communicationInbox');
  await rmMaybe(path.join(root, 'byAlias', aliasId, inboxId));
  await rmMaybe(path.join(root, 'byThread', aliasId, threadId));
}
async function inboxResidue() {
  const root = path.join(dbRoot, 'social', 'communicationInbox');
  const direct = [path.join(root, 'byAlias', aliasId, inboxId), path.join(root, 'byThread', aliasId, threadId)];
  const hits = [];
  for (const item of direct) {
    try { await fs.stat(item); hits.push(item); } catch {}
    try { await fs.stat(`${item}.awtsmoosJSON`); hits.push(`${item}.awtsmoosJSON`); } catch {}
  }
  return hits;
}

try {
  await removeInboxProjection();
  const create = await req('/api/social/civilization/events', form({
    id: eventId, type: 'file.edited', actor: { type: 'alias', id: aliasId },
    target: { type: 'file', id: entityId, aliasId }, targetAliases: [aliasId],
    context: { workspace: runId, program: 'code', threadId },
    payload: { title: 'Civilization file edit', body: runId, actionUrl: `/code?file=${entityId}` }, priority: 7
  }));
  assert(create.status === 200 && create.json?.success?.id === eventId, 'createCivilizationEvent', create);
  assert(create.json?.success?.projections?.some(x => x.aliasId === aliasId), 'projectedToInbox', create);

  const events = await req(`/api/social/civilization/events?targetAliasId=${aliasId}&limit=10`);
  assert(events.json?.success?.some(e => e.id === eventId), 'listCivilizationEvents', events);

  const feed = await req(`/api/social/civilization/feed/${aliasId}`);
  assert(feed.json?.success?.some(e => e.id === eventId && e.feedReason), 'civilizationFeed', feed);

  const inbox = await req(`/api/social/communications/${aliasId}/inbox`);
  assert(inbox.json?.success?.some(item => item.id === inboxId), 'inboxProjectionVisible', inbox);

  const sub = await req(`/api/social/civilization/subscriptions/${aliasId}`, form({ subject: `file:${entityId}`, options: { mode: 'watch' } }));
  assert(sub.json?.success?.subject === `file:${entityId}`, 'subscribeCivilizationSubject', sub);

  const subs = await req(`/api/social/civilization/subscriptions/${aliasId}`);
  assert(subs.json?.success?.some(s => s.subject === `file:${entityId}`), 'listCivilizationSubscriptions', subs);

  const state = await req(`/api/social/civilization/entities/file/${entityId}/state`);
  assert(state.json?.success?.eventCount >= 1, 'entityCivilizationState', state);

  const civState = await req('/api/social/civilization/state');
  assert(civState.json?.success?.totals?.events >= 1, 'civilizationStatePulse', civState);

  const v2 = await req(`/api/v2/social/civilization/events`);
  assert(v2.json?.error?.code === 'INVALID_ROUTE', 'v2StillGone', v2);

  await removeInboxProjection();
  const residue = await inboxResidue();
  assert(residue.length === 0, 'inboxProjectionResidueClean', { residue });
  console.log(JSON.stringify({ pass: true, runId, checks, note: 'Civilization audit event records are append-only by design; smoke cleans its inbox projection.' }, null, 2));
} catch (error) {
  await removeInboxProjection().catch(() => {});
  console.error(JSON.stringify({ pass: false, runId, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
