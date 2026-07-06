// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { runCommand } = require('../tools/command/run.js');
const Store = require('../tools/fs/commandJobStore.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-many-workers-'));
  const config = {
    root,
    allowCommands: true,
    tools: { command: true },
    command: { enabled: true, defaultShell: 'sh', timeoutMs: 10000, maxOutput: 12000 }
  };
  const count = Number(process.env.AWTSMOOS_STRESS_WORKERS || 25);
  const jobs = await Promise.all(Array.from({ length: count }, (_, i) => runCommand(config, {
    command: i % 5 === 0 ? `printf err-${i} >&2; exit 3` : `printf out-${i}`,
    agentSessionId: `session-${i}`,
    logicalAgentId: `agent-${i}`,
    conversationId: `conv-${i}`
  })));
  const jobIds = new Set(jobs.map(j => j.jobId));
  const workerIds = new Set(jobs.map(j => j.workerId));
  const receiptIds = new Set(jobs.map(j => j.receipt?.receiptId));
  assert.strictEqual(jobIds.size, count);
  assert.strictEqual(workerIds.size, count);
  assert.strictEqual(receiptIds.size, count);

  const done = await Promise.all(jobs.map(j => Store.commandWait(config, { jobId: j.jobId, waitTimeoutMs: 10000 })));
  assert.strictEqual(done.length, count);
  assert(done.some(j => j.status === 'failed'));
  assert(done.some(j => j.status === 'completed'));

  for (let i = 0; i < jobs.length; i++) {
    const stream = i % 5 === 0 ? 'stderr' : 'stdout';
    const page = await Store.commandJobOutputPage(config, { jobId: jobs[i].jobId, stream, maxChars: 100 });
    assert.match(page.content, new RegExp(i % 5 === 0 ? `err-${i}` : `out-${i}`));
  }

  console.log(JSON.stringify({ ok: true, suite: 'many-subprocess-workers-stress', count, completed: done.filter(j => j.status === 'completed').length, failed: done.filter(j => j.status === 'failed').length }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
