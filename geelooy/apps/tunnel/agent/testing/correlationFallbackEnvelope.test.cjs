// B"H
const assert = require('assert');
const { responseEnvelope } = require('../lib/runtime/envelope.js');
const got = responseEnvelope({ id: 'relay-1' }, { action: 'list', tunnelName: 'awt' }, { ok: true, action: 'list' }, Date.now(), () => ({ inflight: 0, queued: 0, maxInflight: 16, maxQueue: 5000 }));
assert.equal(got.id, 'relay-1');
assert.ok(got.controlRequestId.startsWith('ctrl_'));
assert.ok(got.clientRequestId.startsWith('client_'));
assert.ok(got.nonce.startsWith('nonce_'));
console.log('B"H blank correlation fields receive local fallback ids');
