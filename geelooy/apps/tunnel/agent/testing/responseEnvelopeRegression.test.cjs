// B"H
const assert = require('assert');
const { responseEnvelope } = require('../lib/runtime/envelope.js');

/**
 * B"H
 * Chapter 518: The envelope became sovereign even after it moved houses.
 *
 * The response envelope now lives in `lib/runtime/envelope.js`, not inline in
 * `main.js`. This regression test follows the real module and proves that a
 * result cannot steal the transport id, type, correlation, action contract, or
 * queue proof from the relay response.
 */
const got = responseEnvelope(
  { id: 'transport-id-1' },
  { action: 'commandRun', tunnelName: 'awt', clientRequestId: 'client-1', controlRequestId: 'ctrl-1', nonce: 'nonce-1' },
  { ok: true, action: 'commandRun', type: 'BAD', id: 'bad-id', controlRequestId: 'bad-ctrl', queueStats: { bad: true }, queuedMs: -1 },
  Date.now() - 5,
  () => ({ inflight: 1, queued: 0, maxInflight: 16, maxQueue: 5000 })
);

assert.equal(got.type, 'TUNNEL_RESPONSE');
assert.equal(got.id, 'transport-id-1');
assert.equal(got.controlRequestId, 'ctrl-1');
assert.equal(got.clientRequestId, 'client-1');
assert.equal(got.nonce, 'nonce-1');
assert.equal(got.requestAction, 'commandRun');
assert.equal(got.actualAction, 'commandRun');
assert.equal(got.actionMismatch, false);
assert.ok(got.queuedMs >= 0);
assert.deepEqual(got.queueStats, { inflight: 1, queued: 0, maxInflight: 16, maxQueue: 5000 });
console.log(JSON.stringify({ ok: true, suite: 'response-envelope-regression' }, null, 2));
