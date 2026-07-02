// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actionBuilders.js');

/**
 * B"H
 * Chapter 516: the worker may lift the stone with a canonical arm, but the
 * messenger must return through the same gate the caller opened. Otherwise the
 * tunnel mistakes a successful receipt for a stranger and calls it mismatch.
 */
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-cmd-alias-'));
  const config = { root, allowCommands: true, tools: { command: true }, command: { enabled: true } };
  const command = process.platform === 'win32' ? 'echo alias' : 'printf alias';
  const startActions = buildActions(config, { action: 'commandStart', command, cwd: '.', timeoutMs: 10000 }, null, 'test');
  const started = await startActions.commandStart();
  assert.equal(started.ok, true);
  assert.ok(started.jobId);

  const statusActions = buildActions(config, { action: 'commandJobStatus', jobId: started.jobId }, null, 'test');
  const status = await statusActions.commandJobStatus();
  assert.equal(status.action, 'commandJobStatus');
  assert.equal(status.requestAction, 'commandJobStatus');
  assert.equal(status.actualAction, 'commandJobStatus');
  assert.equal(status.canonicalAction, 'commandStatus');

  const waitActions = buildActions(config, { action: 'commandJobWait', jobId: started.jobId, waitTimeoutMs: 10000, pollIntervalMs: 25 }, null, 'test');
  const waited = await waitActions.commandJobWait();
  assert.equal(waited.ok, true);
  assert.equal(waited.action, 'commandJobWait');
  assert.equal(waited.requestAction, 'commandJobWait');
  assert.equal(waited.actualAction, 'commandJobWait');
  assert.equal(waited.canonicalAction, 'commandWait');
  assert.equal(waited.status, 'completed');

  const pageActions = buildActions(config, { action: 'commandOutputPage', jobId: started.jobId, stream: 'stdout', maxChars: 2000 }, null, 'test');
  const page = await pageActions.commandOutputPage();
  assert.equal(page.action, 'commandOutputPage');
  assert.equal(page.actualAction, 'commandOutputPage');
  assert.equal(page.canonicalAction, 'commandJobOutputPage');
  assert.match(page.content, /alias/);

  console.log(JSON.stringify({ ok: true, checks: ['status-alias-identity', 'wait-alias-identity', 'page-alias-identity'] }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
