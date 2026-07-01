// B"H
const assert = require('assert');
const Loop = require('../lib/runtime/continuation-loop.js');
const first = {
  ok: true,
  action: 'commandRun',
  requestAction: 'commandRun',
  actualAction: 'commandRun',
  id: 'req-1',
  clientRequestId: 'client-1',
  controlRequestId: 'ctrl-1',
  correlationId: 'corr-1',
  jobId: 'job-1',
  nonce: 'nonce-1',
  tunnelName: 'awt-test',
  cwd: '/tmp',
  command: 'pwd',
  path: '/tmp/project',
  paths: ['/tmp/project']
};
const final = { ok: true, action: 'missionDaemonTick', missionId: 'm1', finalAnswerAllowed: false, mustContinue: true, mustCallNext: { action: 'missionRepeatBetter', missionId: 'm1' } };
const out = Loop.preserve(first, final, [{ step: 1, action: 'missionDaemonTick', missionId: 'm1' }], '');
assert.strictEqual(out.action, 'commandRun');
assert.strictEqual(out.requestAction, 'commandRun');
assert.strictEqual(out.actualAction, 'commandRun');
assert.strictEqual(out.id, 'req-1');
assert.strictEqual(out.clientRequestId, 'client-1');
assert.strictEqual(out.controlRequestId, 'ctrl-1');
assert.strictEqual(out.correlationId, 'corr-1');
assert.strictEqual(out.jobId, 'job-1');
assert.strictEqual(out.nonce, 'nonce-1');
assert.strictEqual(out.tunnelName, 'awt-test');
assert.strictEqual(out.cwd, '/tmp');
assert.strictEqual(out.command, 'pwd');
assert.strictEqual(out.path, '/tmp/project');
assert.deepStrictEqual(out.paths, ['/tmp/project']);
assert.strictEqual(out.autoContinuationFinal.action, 'missionDaemonTick');
assert.strictEqual(out.mission.finalAction, 'missionDaemonTick');
assert.strictEqual(out.mission.continuation.mustCallNext.action, 'missionRepeatBetter');
console.log('continuation identity preserved');
