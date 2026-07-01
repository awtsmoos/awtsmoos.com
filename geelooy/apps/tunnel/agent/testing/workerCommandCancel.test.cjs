// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { startCommandJob, cancelCommandJob, commandStatus } = require('../tools/fs/commandJobStore.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-worker-cancel-'));
  const config = { root, allowCommands:true };
  const command = process.platform === 'win32'
    ? 'ping -n 6 127.0.0.1 > nul'
    : 'sleep 5';
  const started = await startCommandJob(config, { command, cwd:'.', timeoutMs:30000 });
  assert.equal(started.ok, true);
  assert.ok(started.workerId);
  const cancelled = await cancelCommandJob(config, { jobId:started.jobId });
  assert.equal(cancelled.ok, true);
  assert.equal(cancelled.action, 'commandCancel');
  assert.equal(cancelled.jobId, started.jobId);
  const status = await commandStatus(config, { jobId:started.jobId });
  assert.equal(status.ok, true);
  assert.equal(status.action, 'commandStatus');
  assert.equal(status.status, 'cancelled');
  assert.equal(status.receipt.state, 'cancelled');
  assert.equal(status.worker.state, 'cancelled');
  console.log('worker command cancel updates worker and receipt state');
})().catch(error => { console.error(error); process.exit(1); });
