// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { startCommandJob, commandWait } = require('../tools/fs/commandJobStore.js');
const { stats } = require('../main.js');
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-worker-stats-'));
  const config = { root, allowCommands:true };
  const command = process.platform === 'win32' ? 'ping -n 3 127.0.0.1 > nul' : 'sleep 2';
  const started = await startCommandJob(config, { command, cwd:'.', timeoutMs:10000, requestAction:'commandRun', heartbeatMs:500 });
  const visible = stats().workers.active[started.workerId];
  assert.ok(visible);
  assert.equal(visible.action, 'commandRun');
  assert.equal(visible.jobId, started.jobId);
  assert.equal(visible.state, 'running');
  await commandWait(config, { jobId:started.jobId, waitTimeoutMs:10000, pollIntervalMs:100 });
  const after = stats().workers;
  assert.ok(!after.active[started.workerId]);
  assert.ok(after.recent.some(worker => worker.workerId === started.workerId));
  console.log('worker stats visible in queueStats source while command runs');
})().catch(error => { console.error(error); process.exit(1); });
