// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { startCommandJob, commandWait } = require('../tools/fs/commandJobStore.js');
const { getGlobalRegistry } = require('../lib/runtime/worker-supervisor.js');
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-worker-registry-'));
  const config = { root, allowCommands:true };
  const command = process.platform === 'win32' ? 'ping -n 3 127.0.0.1 > nul' : 'sleep 2';
  const started = await startCommandJob(config, { command, cwd:'.', timeoutMs:10000, requestAction:'commandRun', heartbeatMs:500 });
  const snap = getGlobalRegistry().snapshot();
  assert.ok(snap.active[started.workerId]);
  assert.equal(snap.active[started.workerId].jobId, started.jobId);
  assert.equal(snap.active[started.workerId].action, 'commandRun');
  assert.equal(snap.active[started.workerId].state, 'running');
  await commandWait(config, { jobId:started.jobId, waitTimeoutMs:10000, pollIntervalMs:100 });
  const after = getGlobalRegistry().snapshot();
  assert.ok(!after.active[started.workerId]);
  assert.ok(after.recent.some(w => w.workerId === started.workerId));
  console.log('worker registry shows running command and preserves completion receipt');
})().catch(error => { console.error(error); process.exit(1); });
