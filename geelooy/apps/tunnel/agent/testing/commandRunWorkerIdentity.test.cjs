// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-command-run-worker-'));
  const config = { root, allowCommands:true };
  const payload = { action:'commandRun', command:process.platform === 'win32' ? 'echo command-run-worker' : 'printf command-run-worker', cwd:'.', timeoutMs:10000, logicalAgentId:'identity-agent', requestId:'inline-identity-test' };
  const fast = await buildActions(config, payload, null).commandRun();
  assert.equal(fast.ok, true);
  assert.equal(fast.action, 'commandRun');
  assert.equal(fast.requestAction, 'commandRun');
  assert.equal(fast.actualAction, 'commandRun');
  assert.equal(fast.mode, 'sync_command');
  assert.equal(fast.inline, true);
  assert.match(fast.stdout, /command-run-worker/);
  assert.equal(fast.jobId, undefined);
  const asyncResult = await buildActions(config, { ...payload, async:true, requestId:'async-identity-test' }, null).commandRun();
  assert.equal(asyncResult.ok, true);
  assert.equal(asyncResult.action, 'commandRun');
  assert.equal(asyncResult.requestAction, 'commandRun');
  assert.equal(asyncResult.actualAction, 'commandStart');
  assert.equal(asyncResult.mode, 'async_job');
  assert.ok(asyncResult.jobId);
  assert.ok(asyncResult.workerId);
  console.log('commandRun resolves fast inline and preserves async worker identity');
})().catch(error => { console.error(error); process.exit(1); });
