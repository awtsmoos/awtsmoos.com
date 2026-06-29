// B"H
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert/strict');
const R = require('../lib/response-size.js');
const { buildReadActions } = require('../tools/fs/actionGroups/readActions.js');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'large-awdb-read-'));
const big = { ok: true, action: 'probe', payload: 'x'.repeat(200000) };
const compact = R.compactForSend(root, big, { limitBytes: 1024 }).envelope;
assert.equal(compact.outputBackend, 'awtsmoosdb');
assert.ok(compact.outputRef.startsWith('awdb://'));
const read = buildReadActions({ config: { root, tools: { fsRead: true } }, payload: { action: 'read', p: compact.outputRef, maxChars: 80 } }).read;
read().then(out => { assert.equal(out.outputBackend, 'awtsmoosdb'); assert.match(out.content, /"payload"/); console.log(JSON.stringify({ ok: true, outputRef: compact.outputRef, returnedChars: out.returnedChars }, null, 2)); }).catch(err => { console.error(err.stack || err.message); process.exit(1); });
