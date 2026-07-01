// B"H
const assert = require('assert');
const { responseEnvelope } = require('../lib/runtime/envelope.js');
const got = responseEnvelope(
  { id: 'transport-tnal' },
  { action: 'commandRun', command: 'echo hi', tunnelName: 'awt' },
  { ok: false, error: 'tunnel_not_alive', message: 'dead' },
  Date.now(),
  () => ({ inflight: 0, queued: 0 })
);
assert.strictEqual(got.ok, false);
assert.strictEqual(got.error, 'tunnel_not_alive');
assert.strictEqual(got.action, 'commandRun');
assert.strictEqual(got.requestAction, 'commandRun');
assert.strictEqual(got.actualAction, 'commandRun');
assert.strictEqual(got.actionMismatch, false);
console.log('tunnel_not_alive preserves commandRun identity');
