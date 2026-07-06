// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { runCommand } = require('../tools/command/run.js');
const Store = require('../tools/fs/commandJobStore.js');

function config(root) {
  return {
    root,
    allowCommands: true,
    tools: { fsRead: true, command: true },
    command: { enabled: true, defaultShell: 'sh', timeoutMs: 5000, maxOutput: 12000 }
  };
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-multi-session-'));
  await fsp.writeFile(path.join(root, 'probe.txt'), 'session-c-read-ok', 'utf8');
  const c = config(root);
  const long = await runCommand(c, {
    command: 'node -e "setTimeout(()=>console.log(\'A done\'), 2500)"',
    agentSessionId: 'session-a',
    logicalAgentId: 'agent-a',
    conversationId: 'conv-a'
  });
  assert.strictEqual(long.ok, true);
  assert.strictEqual(long.status, 'running');

  const startedAt = Date.now();
  const quick = await runCommand(c, {
    command: 'echo B',
    agentSessionId: 'session-b',
    logicalAgentId: 'agent-b',
    conversationId: 'conv-b'
  });
  const read = await fsp.readFile(path.join(root, 'probe.txt'), 'utf8');
  const stats = await Store.commandStatus(c, { jobId: long.jobId });
  const elapsedMs = Date.now() - startedAt;

  assert.strictEqual(quick.ok, true);
  assert.notStrictEqual(quick.jobId, long.jobId);
  assert.strictEqual(read, 'session-c-read-ok');
  assert.strictEqual(stats.status, 'running');
  assert(elapsedMs < 1000, `quick work waited behind long command for ${elapsedMs}ms`);

  const quickDone = await Store.commandWait(c, { jobId: quick.jobId, waitTimeoutMs: 5000, inlineOutput: true });
  assert.strictEqual(quickDone.status, 'completed');
  assert.match(quickDone.stdout.content, /B/);
  assert.strictEqual(quickDone.receipt.agentSessionId, 'session-b');
  assert.strictEqual(quickDone.receipt.conversationId, 'conv-b');

  const longDone = await Store.commandWait(c, { jobId: long.jobId, waitTimeoutMs: 5000, inlineOutput: true });
  assert.strictEqual(longDone.status, 'completed');
  assert.match(longDone.stdout.content, /A done/);
  assert.strictEqual(longDone.receipt.agentSessionId, 'session-a');
  assert.strictEqual(longDone.receipt.conversationId, 'conv-a');

  console.log(JSON.stringify({ ok: true, suite: 'multi-session-command-isolation', elapsedMs, longJobId: long.jobId, quickJobId: quick.jobId }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
