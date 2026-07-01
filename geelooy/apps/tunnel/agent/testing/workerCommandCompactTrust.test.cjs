// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { startCommandJob, commandWait, commandStatus, commandJobOutputPage } = require('../tools/fs/commandJobStore.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-worker-trust-'));
  const config = { root, allowCommands:true };
  const command = process.platform === 'win32' ? 'echo worker-trust' : 'printf worker-trust';
  const started = await startCommandJob(config, { command, cwd:'.', timeoutMs:10000, requestAction:'commandRun' });
  assert.equal(started.ok, true);
  assert.equal(started.action, 'commandStart');
  assert.equal(started.requestAction, 'commandRun');
  assert.equal(started.actualAction, 'commandStart');
  assert.equal(started.responseProtocol, 'response-v8-compact-trust');
  assert.match(started.summary, /isolated subprocess worker/);
  assert.match(started.next, /commandJobStatus/);
  assert.match(started.trust, /outside the tunnel event loop/);
  assert.ok(started.jobId);
  assert.ok(started.workerId);
  assert.equal(started.worker.kind, 'subprocess');
  assert.equal(started.worker.state, 'running');
  assert.equal(started.receipt.jobId, started.jobId);
  assert.equal(started.receipt.workerId, started.workerId);
  assert.equal(started.receipt.safeToReplay, false);
  assert.ok(started.evidence.includes('receipt_written'));
  assert.ok(started.evidence.includes('subprocess_isolation'));

  const waited = await commandWait(config, { jobId:started.jobId, waitTimeoutMs:10000, pollIntervalMs:50 });
  assert.equal(waited.ok, true);
  assert.equal(waited.action, 'commandWait');
  assert.equal(waited.status, 'completed');

  const status = await commandStatus(config, { jobId:started.jobId });
  assert.equal(status.ok, true);
  assert.equal(status.action, 'commandStatus');
  assert.equal(status.receipt.state, 'completed');
  assert.equal(status.worker.state, 'completed');
  assert.match(status.summary, /completed/);

  const page = await commandJobOutputPage(config, { jobId:started.jobId, stream:'stdout', maxChars:2000 });
  assert.equal(page.ok, true);
  assert.match(page.content, /worker-trust/);
  console.log('worker command compact trust response preserves identity and records receipt');
})().catch(error => { console.error(error); process.exit(1); });
