// B"H
const assert = require('assert');
const { normalizeWrites, describeWritePayload } = require('../tools/fs/writePayload.js');
const payloads = [
  { path: '.', writes: JSON.stringify([{ path: 'a.txt', content: 'A' }, { path: 'b.txt', content: 'B' }]) },
  { path: '.', params: { writes: [{ path: 'c.txt', content: 'C' }] } },
  { path: '.', files: { 'd.txt': 'D', 'e.txt': { content: 'E' } } },
  [{ path: 'f.txt', content: 'F' }]
];
const counts = payloads.map(p => normalizeWrites(p).length);
assert.deepEqual(counts, [2, 1, 2, 1]);
assert.equal(normalizeWrites({ path: '.' }).length, 0);
assert.equal(describeWritePayload(payloads[0]).writeCount, 2);
console.log(JSON.stringify({ ok: true, counts, checks: ['writes-json-array','params-writes','files-map','array','dot-not-file'] }, null, 2));
