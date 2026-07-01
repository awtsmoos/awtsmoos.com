// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-command-run-worker-'));
  const config = { root, allowCommands:true };
  const payload = { action:'commandRun', command:process.platform === 'win32' ? 'echo command-run-worker' : 'printf command-run-worker', cwd:'.', timeoutMs:10000 };
  const out = await buildActions(config, payload, null).commandRun();
  assert.equal(out.ok, true);
  assert.equal(out.action, 'commandRun');
  assert.equal(out.requestAction, 'commandRun');
  assert.equal(out.actualAction, 'commandStart');
  assert.equal(out.mode, 'async_job');
  assert.ok(out.jobId);
  assert.ok(out.workerId);
  assert.match(out.summary, /commandRun.*isolated subprocess worker/);
  assert.match(out.next, /commandJobStatus/);
  assert.equal(out.receipt.requestAction, 'commandRun');
  assert.equal(out.receipt.actualAction, 'commandStart');
  console.log('commandRun starts worker while preserving top-level action identity');
})().catch(error => { console.error(error); process.exit(1); });
