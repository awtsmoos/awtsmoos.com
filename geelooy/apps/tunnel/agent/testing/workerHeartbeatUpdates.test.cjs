// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { startCommandJob, commandStatus, commandWait } = require('../tools/fs/commandJobStore.js');
const { getGlobalRegistry } = require('../lib/runtime/worker-supervisor.js');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-worker-heartbeat-'));
  const config = { root, allowCommands:true };
  const command = process.platform === 'win32' ? 'ping -n 4 127.0.0.1 > nul' : 'sleep 3';
  const started = await startCommandJob(config, { command, cwd:'.', timeoutMs:10000, heartbeatMs:400 });
  const first = getGlobalRegistry().snapshot().active[started.workerId].heartbeatAt;
  await sleep(950);
  const secondSnap = getGlobalRegistry().snapshot().active[started.workerId];
  const status = await commandStatus(config, { jobId:started.jobId });
  assert.ok(secondSnap.heartbeatAt !== first || secondSnap.heartbeatAgeMs < 700);
  assert.equal(status.worker.workerId, started.workerId);
  assert.ok(Date.parse(status.worker.heartbeatAt) >= Date.parse(first));
  await commandWait(config, { jobId:started.jobId, waitTimeoutMs:10000, pollIntervalMs:100 });
  console.log('worker heartbeat updates while command is running');
})().catch(error => { console.error(error); process.exit(1); });
