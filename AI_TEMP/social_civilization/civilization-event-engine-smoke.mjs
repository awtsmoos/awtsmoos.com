// B"H
import fs from 'node:fs/promises';
import path from 'node:path';

const base = process.env.AWTSMOOS_BASE || 'http://127.0.0.1:8080';
const dbRoot = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const runId = `civ_event_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const aliasId = `${runId}_alias`;
const entityId = `${runId}_file`;
const eventId = `${runId}_event`;
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
async function removeResidue() {
  const hits = await scanResidue();
  for (const hit of hits.sort((a, b) => b.length - a.length)) await fs.rm(hit, { recursive: true, force: true }).catch(() => {});
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
      else {
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
  const create = await req('/api/social/civilization/events', form({
    id: eventId, type: 'file.edited', actor: { type: 'alias', id: aliasId },
    target: { type: 'file', id: entityId, aliasId }, targetAliases: [aliasId],
    context: { workspace: runId, program: 'code', threadId: `${runId}_thread` },
    payload: { title: 'Civilization file edit', body: runId, actionUrl: `/code?file=${entityId}` }, priority: 7
  }));
  assert(create.status === 200 && create.json?.success?.id === eventId, 'createCivilizationEvent', create);
  assert(create.json?.success?.projections?.some(x => x.aliasId === aliasId), 'projectedToInbox', create);

  const events = await req(`/api/social/civilization/events?targetAliasId=${aliasId}&limit=10`);
  assert(events.json?.success?.some(e => e.id === eventId), 'listCivilizationEvents', events);

  const feed = await req(`/api/social/civilization/feed/${aliasId}`);
  assert(feed.json?.success?.some(e => e.id === eventId && e.feedReason), 'civilizationFeed', feed);

  const inbox = await req(`/api/social/communications/${aliasId}/inbox`);
  assert(inbox.json?.success?.some(item => item.id === `civ_${eventId}`), 'inboxProjectionVisible', inbox);

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

  await removeResidue();
  const residue = await scanResidue();
  assert(residue.length === 0, 'residueClean', { residue });
  console.log(JSON.stringify({ pass: true, runId, checks }, null, 2));
} catch (error) {
  await removeResidue().catch(() => {});
  console.error(JSON.stringify({ pass: false, runId, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
