// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { requestPayload } = require('../main.js');
const { buildActions } = require('../tools/fs/actions.js');
const Store = require('../tools/fs/commandJobStore.js');

function b64(value) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64');
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-command-params64-correlation-'));
  const config = { root, allowCommands: true, tools: { command: true }, command: { enabled: true } };
  const payload = requestPayload({
    id: 'outer-transport',
    agentSessionId: 'session-from-outer',
    payload: {
      action: 'commandStart',
      command: process.platform === 'win32' ? 'echo params64-correlation' : 'printf params64-correlation',
      cwd: '.',
      timeoutMs: 5000,
      params64: b64({
        missionId: 'mission-from-params64',
        roomId: 'room-from-params64',
        logicalAgentId: 'agent-from-params64',
        conversationId: 'conversation-from-params64',
        conversationName: 'Params64 Conversation',
        leaseId: 'lease-from-params64'
      })
    }
  });

  const started = await buildActions(config, payload, null).commandStart();
  assert.equal(started.ok, true);
  assert.equal(started.receipt.missionId, 'mission-from-params64');
  assert.equal(started.receipt.roomId, 'room-from-params64');
  assert.equal(started.receipt.agentSessionId, 'session-from-outer');
  assert.equal(started.receipt.logicalAgentId, 'agent-from-params64');
  assert.equal(started.receipt.conversationId, 'conversation-from-params64');
  assert.equal(started.receipt.conversationName, 'Params64 Conversation');
  assert.equal(started.receipt.leaseId, 'lease-from-params64');
  assert.equal(started.worker.roomId, 'room-from-params64');
  assert.equal(started.worker.logicalAgentId, 'agent-from-params64');

  const done = await Store.commandWait(config, { jobId: started.jobId, waitTimeoutMs: 5000 });
  assert.equal(done.status, 'completed');
  assert.equal(done.receipt.missionId, 'mission-from-params64');
  assert.equal(done.worker.agentSessionId, 'session-from-outer');
  assert.equal(done.worker.conversationId, 'conversation-from-params64');

  console.log(JSON.stringify({ ok: true, suite: 'command-params64-correlation', jobId: started.jobId }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
