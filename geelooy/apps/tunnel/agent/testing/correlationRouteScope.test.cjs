// B"H
const assert = require('assert');
const { requestPayload, routedData } = require('../main.js');

/**
 * B"H
 * A response must not wander from one shliach to another. If the relay gives
 * route identity on the outer request, the agent folds it into payload before
 * progress, errors, and final envelopes are spoken.
 */
const data = {
  id: 'outer-control-id',
  controlRequestId: 'ctrl-a',
  clientRequestId: 'client-a',
  agentSessionId: 'session-a',
  logicalAgentId: 'agent-a',
  conversationId: 'conv-a',
  conversationName: 'Conversation A',
  missionId: 'mission-a',
  nonce: 'nonce-a',
  payload: { action: 'read', kind: 'fs', path: '.', clientRequestId: 'client-payload-wins' }
};

const payload = requestPayload(data);
assert.equal(payload.controlRequestId, 'ctrl-a');
assert.equal(payload.clientRequestId, 'client-payload-wins');
assert.equal(payload.agentSessionId, 'session-a');
assert.equal(payload.logicalAgentId, 'agent-a');
assert.equal(payload.conversationId, 'conv-a');
assert.equal(payload.conversationName, 'Conversation A');
assert.equal(payload.missionId, 'mission-a');
assert.equal(payload.nonce, 'nonce-a');
assert.equal(payload.action, 'read');
assert.equal(routedData(data).payload.agentSessionId, 'session-a');

console.log(JSON.stringify({ ok: true, checks: ['top-level-route-folded', 'payload-fields-preserved'] }, null, 2));
