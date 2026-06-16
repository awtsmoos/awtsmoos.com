// B"H
/**
 * @file stress-write-flexibility.mjs
 * @brief Stresses flexible write payloads and action ledger recording.
 * Chapter 471: The scribe arrived in many garments: raw arrays, JSON strings,
 * nested params, maps, aliases, XML CDATA, and placeholders. Every garment must
 * become complete-file writes, with redacted memory in the ledger.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { normalizeWrites, describeWritePayload } = require('../geelooy/apps/tunnel/agent/tools/fs/writePayload.js');
const { handleBulkWrite } = require('../geelooy/apps/tunnel/agent/tools/fs/actionGroups/writeActions.js');
const ledger = require('../geelooy/apps/tunnel/agent/tools/fs/actionLedger.js');
const ROOT = process.cwd();
const REL = '.awtsmoos/tmp/write-flexibility-stress';
const DIR = path.join(ROOT, REL);

function config() {
  return { root: ROOT, allowWrite: true, allowSecrets: true, tools: { fsRead: true, fsWrite: true, fsBulk: true } };
}
function rel(name) { return `${REL}/${name}`; }
async function reset() { await fs.rm(DIR, { recursive: true, force: true }); await fs.mkdir(DIR, { recursive: true }); }
async function readRel(name) { return await fs.readFile(path.join(DIR, name), 'utf8'); }

function assertNormalized(label, payload, expected) {
  const writes = normalizeWrites(payload);
  assert.deepEqual(writes, expected, label);
  assert.equal(describeWritePayload(payload).writeCount, expected.length, `${label}: shape count`);
}

async function assertBulk(label, payload, files) {
  const result = await handleBulkWrite(config(), payload, 'bulkWrite');
  assert.equal(result.ok, true, `${label}: ok`);
  assert.equal(result.count, files.length, `${label}: count`);
  assert.equal(result.payloadShape.writeCount, files.length, `${label}: payload shape`);
  for (const [name, text] of files) assert.equal(await readRel(name), text, `${label}: ${name}`);
}

await reset();
assertNormalized('raw array', [
  { path: rel('raw-a.txt'), content: 'raw A' },
  { p: rel('raw-b.txt'), text: 'raw B' }
], [
  { path: rel('raw-a.txt'), content: 'raw A' },
  { path: rel('raw-b.txt'), content: 'raw B' }
]);
assertNormalized('json carrier', {
  content: JSON.stringify({ writes: [{ path: rel('json.txt'), content: 'json content' }] })
}, [{ path: rel('json.txt'), content: 'json content' }]);
assertNormalized('files map', { files: { [rel('map.txt')]: 'map content' } }, [
  { path: rel('map.txt'), content: 'map content' }
]);
assertNormalized('nested aliases', {
  params: JSON.stringify({ writes: [{ filePath: rel('alias.txt'), value: 'alias value' }] })
}, [{ path: rel('alias.txt'), content: 'alias value' }]);
assertNormalized('xml cdata', {
  xml: `<writes><file path="${rel('xml.txt')}"><content><![CDATA[xml <kept> & whole]]></content></file></writes>`
}, [{ path: rel('xml.txt'), content: 'xml <kept> & whole' }]);
assertNormalized('xml placeholder', {
  body: `<writes><file p="${rel('placeholder.txt')}"><text>{{AWTSMOOS_CDATA_START}}placeholder <ok>{{AWTSMOOS_CDATA_END}}</text></file></writes>`
}, [{ path: rel('placeholder.txt'), content: 'placeholder <ok>' }]);
await assertBulk('bulk json string', {
  action: 'bulkWrite', content: JSON.stringify({ writes: [{ path: rel('bulk-json.txt'), content: 'bulk json' }] })
}, [['bulk-json.txt', 'bulk json']]);
await assertBulk('bulk xml placeholder', {
  action: 'bulkWrite',
  body: `<writes><file path="${rel('bulk-xml.txt')}"><content>[[AWTSMOOS_CDATA_START]]bulk xml & <tag>[[AWTSMOOS_CDATA_END]]</content></file></writes>`
}, [['bulk-xml.txt', 'bulk xml & <tag>']]);
const secret = 'sk-secret-1234567890abcdef should redact';
const logged = await ledger.record(config(), {
  action: 'bulkWrite', content: JSON.stringify({ writes: [{ path: rel('ledger.txt'), content: secret }] })
}, { ok: true, action: 'bulkWrite', result: secret });
assert.equal(logged.replayable, true, 'ledger replayable');
const stored = JSON.parse(await fs.readFile(path.join(ROOT, logged.outputRef), 'utf8'));
assert.match(JSON.stringify(stored), /\[REDACTED\]/, 'ledger redacts secrets');
console.log(JSON.stringify({ ok: true, checks: [
  'raw-array', 'json-carrier', 'files-map', 'nested-aliases', 'xml-cdata',
  'xml-placeholder', 'bulk-json-string', 'bulk-xml-placeholder', 'ledger-redaction'
] }, null, 2));
