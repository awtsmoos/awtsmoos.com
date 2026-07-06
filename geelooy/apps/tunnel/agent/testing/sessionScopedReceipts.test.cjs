// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { runCommand } = require('../tools/command/run.js');
const Store = require('../tools/fs/commandJobStore.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-session-receipts-'));
  const config = {
    root,
    allowCommands: true,
    tools: { command: true },
    command: { enabled: true, defaultShell: 'sh', timeoutMs: 5000, maxOutput: 12000 }
  };
  const base = {
    command: 'printf scoped',
    missionId: 'mission-a',
    agentSessionId: 'session-a',
    logicalAgentId: 'agent-alpha',
    conversationId: 'conv-a',
    conversationName: 'Conversation A',
    leaseId: 'lease-a'
  };
  const started = await runCommand(config, base);
  assert.strictEqual(started.ok, true);
  assert.strictEqual(started.action, 'commandRun');
  assert.ok(started.jobId);
  assert.ok(started.workerId);
  assert.ok(started.receipt.receiptId);
  assert.strictEqual(started.receipt.agentSessionId, 'session-a');
  assert.strictEqual(started.receipt.logicalAgentId, 'agent-alpha');
  assert.strictEqual(started.receipt.conversationId, 'conv-a');
  assert.strictEqual(started.receipt.conversationName, 'Conversation A');
  assert.strictEqual(started.receipt.leaseId, 'lease-a');

  const done = await Store.commandWait(config, { jobId: started.jobId, waitTimeoutMs: 5000 });
  assert.strictEqual(done.status, 'completed');
  assert.strictEqual(done.receipt.agentSessionId, 'session-a');
  assert.strictEqual(done.receipt.conversationId, 'conv-a');
  assert.strictEqual(done.worker.agentSessionId, 'session-a');
  assert.strictEqual(done.worker.conversationId, 'conv-a');

  console.log(JSON.stringify({ ok: true, suite: 'session-scoped-receipts', jobId: started.jobId, workerId: started.workerId }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
