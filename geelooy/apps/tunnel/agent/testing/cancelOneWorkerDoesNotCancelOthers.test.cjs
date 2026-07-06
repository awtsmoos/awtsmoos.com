// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { startCommandJob, cancelCommandJob, commandStatus, commandWait } = require('../tools/fs/commandJobStore.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-cancel-isolation-'));
  const config = { root, allowCommands: true };
  const a = await startCommandJob(config, { command: `${process.execPath} -e "setTimeout(()=>console.log('A'), 5000)"`, agentSessionId: 'session-a' });
  const b = await startCommandJob(config, { command: `${process.execPath} -e "setTimeout(()=>console.log('B'), 1000)"`, agentSessionId: 'session-b' });
  assert.strictEqual(a.ok, true);
  assert.strictEqual(b.ok, true);
  assert.notStrictEqual(a.jobId, b.jobId);

  const cancelled = await cancelCommandJob(config, { jobId: a.jobId });
  assert.strictEqual(cancelled.cancelled, true);
  const aStatus = await commandStatus(config, { jobId: a.jobId });
  const bStatus = await commandStatus(config, { jobId: b.jobId });
  assert.strictEqual(aStatus.status, 'cancelled');
  assert.notStrictEqual(bStatus.status, 'cancelled');

  const bDone = await commandWait(config, { jobId: b.jobId, waitTimeoutMs: 5000, inlineOutput: true });
  assert.strictEqual(bDone.status, 'completed');
  assert.match(bDone.stdout.content, /B/);
  console.log(JSON.stringify({ ok: true, suite: 'cancel-one-worker-does-not-cancel-others', cancelledJobId: a.jobId, survivingJobId: b.jobId }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
