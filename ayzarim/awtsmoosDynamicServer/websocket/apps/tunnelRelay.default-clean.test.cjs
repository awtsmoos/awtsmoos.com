// B"H
const assert = require('assert');
const R = require('./tunnelRelay.js');
const clean = R.cleanRelayPayload({ action:'list' });
assert.equal(clean.autoPreview, false);
assert.equal(clean.relayWaitMs, 5000);
assert.equal(clean.httpSafeWaitMs, 5000);
const explicit = R.cleanRelayPayload({ action:'list', autoPreview:true, relayWaitMs:9000 });
assert.equal(explicit.autoPreview, true);
assert.equal(explicit.relayWaitMs, 9000);
const pending = R.timeoutEnvelope({ id:'ctrl1', tunnelName:'t1', requestedAction:'list' }, 5000, 120000);
assert.equal(pending.next.action, 'retryAction');
assert.equal(pending.resumeToken, 'ctrl1');
console.log('B"H relay default clean payload test passed');
