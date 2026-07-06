// B"H
const assert = require('assert');
const C = require('../lib/runtime/correlation-scope.js');
const { requestPayload, routedData } = require('../main.js');
const { responseEnvelope } = require('../lib/runtime/envelope.js');

function b64(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
}

const request = {
  id: 'transport-id',
  controlRequestId: 'outer-ctrl',
  clientRequestId: 'outer-client',
  agentSessionId: 'outer-session',
  conversationName: 'Outer Conversation',
  payload: {
    action: 'payloadEcho',
    kind: 'fs',
    controlRequestId: 'payload-ctrl',
    params: {
      clientRequestId: 'params-client',
      workspaceId: 'workspace-a'
    },
    params64: b64({
      missionId: 'mission-from-params64',
      roomId: 'room-from-params64',
      traceId: 'trace-from-params64',
      payload: { spanId: 'span-from-nested-payload' }
    }),
    payload: {
      logicalAgentId: 'logical-from-nested-payload',
      conversationId: 'conversation-from-nested-payload'
    },
    body: JSON.stringify({
      projectRoot: '/tmp/project-from-body',
      parentActionId: 'parent-from-body'
    }),
    content64: b64({
      workerId: 'worker-from-content64',
      jobId: 'job-from-content64',
      receiptId: 'receipt-from-content64'
    })
  }
};

const scope = C.extractCorrelationScope(request);
assert.equal(scope.controlRequestId, 'payload-ctrl');
assert.equal(scope.clientRequestId, 'params-client');
assert.equal(scope.agentSessionId, 'outer-session');
assert.equal(scope.logicalAgentId, 'logical-from-nested-payload');
assert.equal(scope.conversationId, 'conversation-from-nested-payload');
assert.equal(scope.conversationName, 'Outer Conversation');
assert.equal(scope.workspaceId, 'workspace-a');
assert.equal(scope.missionId, 'mission-from-params64');
assert.equal(scope.roomId, 'room-from-params64');
assert.equal(scope.traceId, 'trace-from-params64');
assert.equal(scope.spanId, 'span-from-nested-payload');
assert.equal(scope.projectRoot, '/tmp/project-from-body');
assert.equal(scope.parentActionId, 'parent-from-body');
assert.equal(scope.workerId, 'worker-from-content64');
assert.equal(scope.jobId, 'job-from-content64');
assert.equal(scope.receiptId, 'receipt-from-content64');

const payload = requestPayload(request);
assert.equal(payload.action, 'payloadEcho');
assert.equal(payload.controlRequestId, 'payload-ctrl');
assert.equal(payload.clientRequestId, 'params-client');
assert.equal(payload.agentSessionId, 'outer-session');
assert.equal(payload.logicalAgentId, 'logical-from-nested-payload');
assert.equal(payload.conversationId, 'conversation-from-nested-payload');
assert.equal(payload.missionId, 'mission-from-params64');
assert.equal(payload.roomId, 'room-from-params64');
assert.equal(payload.projectRoot, '/tmp/project-from-body');
assert.equal(routedData(request).payload.traceId, 'trace-from-params64');

const env = C.correlationEnv(payload);
assert.equal(env.AWTSMOOS_AGENT_SESSION_ID, 'outer-session');
assert.equal(env.AWTSMOOS_LOGICAL_AGENT_ID, 'logical-from-nested-payload');
assert.equal(env.AWTSMOOS_MISSION_ID, 'mission-from-params64');
assert.equal(env.AWTSMOOS_ROOM_ID, 'room-from-params64');
assert.equal(env.AWTSMOOS_TRACE_ID, 'trace-from-params64');

assert.deepEqual(C.correlationReceipt(payload), {
  receiptId: 'receipt-from-content64',
  jobId: 'job-from-content64',
  workerId: 'worker-from-content64',
  missionId: 'mission-from-params64',
  roomId: 'room-from-params64',
  agentSessionId: 'outer-session',
  logicalAgentId: 'logical-from-nested-payload',
  conversationId: 'conversation-from-nested-payload',
  conversationName: 'Outer Conversation',
  traceId: 'trace-from-params64',
  spanId: 'span-from-nested-payload'
});

assert.equal(C.correlationWorker(payload).parentActionId, 'parent-from-body');
assert.equal(C.correlationPreview(payload).projectRoot, '/tmp/project-from-body');

const envelope = responseEnvelope(
  { id: 'transport-id' },
  payload,
  { ok: true, action: 'payloadEcho' },
  Date.now(),
  () => ({ inflight: 0, queued: 0, maxInflight: 16, maxQueue: 5000 })
);
assert.equal(envelope.controlRequestId, 'payload-ctrl');
assert.equal(envelope.clientRequestId, 'params-client');
assert.equal(envelope.agentSessionId, 'outer-session');
assert.equal(envelope.logicalAgentId, 'logical-from-nested-payload');
assert.equal(envelope.conversationId, 'conversation-from-nested-payload');
assert.equal(envelope.missionId, 'mission-from-params64');
assert.equal(envelope.roomId, 'room-from-params64');
assert.equal(envelope.traceId, 'trace-from-params64');
assert.equal(envelope.nonce.startsWith('nonce_'), true);

const fromPayload64 = requestPayload({
  id: 'payload64-transport',
  payload64: b64({
    action: 'payloadEcho',
    kind: 'fs',
    params: {
      missionId: 'mission-from-payload64-params',
      roomId: 'room-from-payload64-params',
      logicalAgentId: 'agent-from-payload64-params'
    }
  })
});
assert.equal(fromPayload64.action, 'payloadEcho');
assert.equal(fromPayload64.kind, 'fs');
assert.equal(fromPayload64.missionId, 'mission-from-payload64-params');
assert.equal(fromPayload64.roomId, 'room-from-payload64-params');
assert.equal(fromPayload64.logicalAgentId, 'agent-from-payload64-params');
assert.equal(fromPayload64.controlRequestId, 'payload64-transport');

console.log(JSON.stringify({ ok: true, suite: 'correlation-scope-carriers' }, null, 2));
