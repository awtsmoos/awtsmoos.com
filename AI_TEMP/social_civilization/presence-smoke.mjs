// B"H
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const origin = 'http://127.0.0.1:8080';
const socketUrl = 'ws://127.0.0.1:8080';
const runId = `presence_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
const channel = `page:/social/${runId}`;
const dbRoot = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/social';

function openClient(aliasId) {
  const seen = [];
  const ws = new WebSocket(socketUrl);
  ws.onmessage = event => seen.push(JSON.parse(event.data));
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`open timeout ${aliasId}`)), 4000);
    ws.onerror = error => reject(error);
    ws.onopen = () => {
      clearTimeout(timer);
      ws.send(JSON.stringify({ type: 'LOGIN', aliasId }));
      resolve({ ws, aliasId, seen });
    };
  });
}

function send(client, payload) {
  client.ws.send(JSON.stringify(payload));
}

function waitFor(client, check, label, ms = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      const found = client.seen.find(check);
      if (found) {
        clearInterval(timer);
        resolve(found);
        return;
      }
      if (Date.now() - start > ms) {
        clearInterval(timer);
        reject(new Error(`${label} timed out for ${client.aliasId}; seen ${JSON.stringify(client.seen)}`));
      }
    }, 40);
  });
}

async function scanResidue(dir) {
  const found = [];
  async function walk(current) {
    let entries = [];
    try { entries = await readdir(current, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const path = join(current, entry.name);
      if (entry.name.includes(runId)) found.push({ kind: 'filename', path });
      if (entry.isDirectory()) {
        await walk(path);
        continue;
      }
      if (!entry.isFile()) continue;
      try {
        const text = await readFile(path, 'utf8');
        if (text.includes(runId)) found.push({ kind: 'text', path });
      } catch {}
    }
  }
  await walk(dir);
  return found;
}

const a = await openClient(`${runId}_a`);
const b = await openClient(`${runId}_b`);

send(a, { type: 'PAGE_ENTER', aliasId: a.aliasId, channel, status: 'testing' });
await waitFor(a, msg => msg.type === 'PAGE_PRESENCE' && msg.channel === channel && msg.count === 1, 'count 1');

send(b, { type: 'PAGE_ENTER', aliasId: b.aliasId, channel, status: 'testing' });
await waitFor(a, msg => msg.type === 'PAGE_PRESENCE' && msg.channel === channel && msg.count === 2, 'a count 2');
await waitFor(b, msg => msg.type === 'PAGE_PRESENCE' && msg.channel === channel && msg.count === 2, 'b count 2');

send(a, { type: 'PAGE_TYPING', aliasId: a.aliasId, channel, typing: true });
await waitFor(b, msg => msg.type === 'PAGE_PRESENCE' && msg.channel === channel && msg.reason === 'typing', 'typing broadcast');

send(a, { type: 'PAGE_READING', aliasId: a.aliasId, channel, reading: '/social/' });
await waitFor(b, msg => msg.type === 'PAGE_PRESENCE' && msg.channel === channel && msg.reason === 'reading', 'reading broadcast');

send(b, { type: 'PAGE_LEAVE', aliasId: b.aliasId, channel });
await waitFor(a, msg => msg.type === 'PAGE_PRESENCE' && msg.channel === channel && msg.count === 1 && msg.reason === 'leave', 'leave decrement');

const v2 = await fetch(`${origin}/api/v2/social/meta`).then(r => r.json());
assert.equal(v2?.error?.code, 'INVALID_ROUTE');

const page = await fetch(`${origin}/social/`).then(r => r.text());
assert.ok(page.includes('/style/social/live/presence.css'), 'social page links presence css');

const badge = await fetch(`${origin}/scripts/awtsmoos/social/live/presenceBadge.js`).then(r => r.text());
assert.ok(badge.includes('BH_PAGE_PRESENCE_BADGE'), 'presence badge asset served');

const residue = await scanResidue(dbRoot);
assert.deepEqual(residue, []);

a.ws.close();
b.ws.close();
console.log(JSON.stringify({ pass: true, runId, channel, checks: ['count1', 'count2', 'typing', 'reading', 'leave', 'v2Gone', 'badgeAsset', 'residueClean'] }, null, 2));
