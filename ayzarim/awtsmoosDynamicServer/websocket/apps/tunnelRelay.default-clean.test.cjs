// B"H
const assert = require('assert');
const R = require('./tunnelRelay.js');
const { verifyTunnelResponse } = require('../../../../geelooy/api/tunnel/control/routes/fsVessel/responseContract.js');
const clean = R.cleanRelayPayload({ action:'list' });
assert.equal(clean.autoPreview, false);
assert.equal(clean.relayWaitMs, 5000);
assert.equal(clean.httpSafeWaitMs, 5000);
const explicit = R.cleanRelayPayload({ action:'list', autoPreview:true, relayWaitMs:9000 });
assert.equal(explicit.autoPreview, true);
assert.equal(explicit.relayWaitMs, 9000);
const expected = {
  id:'ctrl1', tunnelName:'t1', requestedTunnelName:'t1', requestedAction:'list',
  controlRequestId:'ctrl1', clientRequestId:'client1', agentSessionId:'session1',
  logicalAgentId:'agent1', projectRoot:'/repo', nonce:'nonce1', path:'src'
};
const payload = {
  action:'list', controlRequestId:'ctrl1', clientRequestId:'client1',
  agentSessionId:'session1', logicalAgentId:'agent1', projectRoot:'/repo',
  nonce:'nonce1', path:'src'
};
const pending = R.timeoutEnvelope(expected, 5000, 120000);
assert.equal(pending.next.action, 'retryAction');
assert.equal(pending.resumeToken, 'ctrl1');
assert.equal(pending.requestAction, 'list');
assert.equal(pending.clientRequestId, 'client1');
assert.equal(pending.nonce, 'nonce1');
assert.equal(verifyTunnelResponse(pending, payload, 't1'), pending);
const missing = R.missingTunnelEnvelope(expected);
assert.equal(verifyTunnelResponse(missing, payload, 't1'), missing);
const failed = R.sendFailureEnvelope('ctrl1', expected, new Error('closed'));
assert.equal(verifyTunnelResponse(failed, payload, 't1'), failed);
console.log('B"H relay default clean payload test passed');
