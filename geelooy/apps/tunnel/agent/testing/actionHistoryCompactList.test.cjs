// B"H
const assert = require('assert');
const H = require('../tools/fs/actionGroups/actionHistoryActions.js');

const huge = 'x'.repeat(5000);
const entry = {
  actionId: 'act_big',
  action: 'write',
  ok: true,
  createdAt: 'now',
  input: { action: 'write', path: '/tmp/a', content: huge, command: huge, nested: { text: huge } }
};
const compact = H.compactHistory(entry);
const json = JSON.stringify(compact);
assert(json.length < 1500, 'compact history must not echo giant payloads');
assert.equal(compact.input.content.elided, true);
assert.equal(compact.input.command.elided, true);
assert.equal(compact.input.nested.text.elided, true);
assert.equal(H.wantsFull({ responseMode: 'full' }), true);
assert.equal(H.wantsFull({}), false);
console.log(JSON.stringify({ ok: true, suite: 'action-history-compact-list', bytes: json.length }, null, 2));
