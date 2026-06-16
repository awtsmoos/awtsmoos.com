// B"H
/**
 * Chapter 476: The command no longer asks the gateway to hold the ocean.
 * Default command calls must return a job immediately; output is read through
 * pages. Only sync:true may ask for inline thunder.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildCommandActions, shouldRunSync } = require('../geelooy/apps/tunnel/agent/tools/fs/actionGroups/commandActions.js');
const cfg = { root: process.cwd(), allowCommands: true, tools: {} };

function actions(payload) {
  return buildCommandActions({ config: cfg, payload });
}
async function sleep(ms) { await new Promise(resolve => setTimeout(resolve, ms)); }

assert.equal(shouldRunSync({}), false);
assert.equal(shouldRunSync({ sync: true }), true);
const started = await actions({ action: 'command', command: 'node -e "console.log(123)"' }).command();
assert.equal(started.ok, true);
assert.equal(started.mode, 'async_job');
assert.ok(started.jobId);
let status = null;
let page = null;
for (let i = 0; i < 80; i += 1) {
  status = await actions({ jobId: started.jobId }).commandStatus();
  page = await actions({ jobId: started.jobId, stream: 'stdout' }).commandJobOutputPage();
  if (/123/.test(page.content) && !status.running) break;
  await sleep(100);
}
assert.equal(status.ok, true);
assert.match(page.content, /123/);
assert.notEqual(status.status, 'job_not_found_or_expired');
const sync = await actions({ action: 'command', command: 'node -e "console.log(456)"', sync: true }).command();
assert.equal(sync.ok, true);
assert.match(sync.stdout, /456/);
console.log(JSON.stringify({ ok: true, checks: ['default-async-job', 'status', 'output-page', 'sync-opt-in'] }, null, 2));
