// B"H
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const origin = process.env.AWTS_STRESS_ORIGIN || 'http://127.0.0.1:8080';
const dbRoot = path.resolve(process.cwd(), '../../dayuhChadash');
const run = `discover_precedence_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
const heichelId = `${run}_heichel`;
const aliasId = `${run}_alias`;

async function request(route, { method = 'GET' } = {}) {
  const response = await fetch(origin + route, { method });
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, text, json };
}

async function main() {
  const db = new DosDB(dbRoot);
  await db.init();
  await db.write(`/social/heichelos/${heichelId}/info`, { name: `Discover Precedence ${run}`, author: aliasId, description: `unique ${run}` });
  const discover = await request(`/api/social/heichelos/discover?q=${encodeURIComponent(run)}&limit=10`);
  assert.equal(discover.status, 200, discover.text);
  assert.equal(discover.json.ok, true, discover.text);
  assert.ok(Array.isArray(discover.json.data), discover.text);
  assert.ok(discover.json.data.some(item => item.id === heichelId), `discover did not return ${heichelId}: ${discover.text}`);
  const badMethod = await request('/api/social/heichelos/discover', { method: 'POST' });
  assert.equal(badMethod.status, 200, badMethod.text);
  assert.ok(badMethod.json.error || badMethod.json.code || badMethod.text.includes('BAD_METHOD'), badMethod.text);
  const legacyProfileMeta = await request('/api/social/profile/meta');
  assert.equal(legacyProfileMeta.status, 200, legacyProfileMeta.text);
  await db.delete(`/social/heichelos/${heichelId}`).catch(() => {});
  console.log(JSON.stringify({ BH: 'B"H', pass: true, checked: ['canonicalDiscover', 'queryMatch', 'methodGuard', 'legacyProfileStillMounted'] }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
