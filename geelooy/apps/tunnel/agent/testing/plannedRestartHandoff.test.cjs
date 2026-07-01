// B"H
const assert = require('assert');
const Recovery = require('../lib/runtime/recovery-envelope.js');
const got = Recovery.plannedRestartEnvelope(
  { action: 'commandRun', command: 'installer' },
  { handoffId: 'restart_1', oldTunnelName: 'awt-awtsmoos-2113', expectedReconnectMs: 15000 }
);
assert.strictEqual(got.ok, false);
assert.strictEqual(got.error, 'planned_restart_pending');
assert.strictEqual(got.action, 'commandRun');
assert.strictEqual(got.requestAction, 'commandRun');
assert.strictEqual(got.actualAction, 'commandRun');
assert.strictEqual(got.plannedRestart, true);
assert.strictEqual(got.handoff.handoffId, 'restart_1');
console.log('planned restart handoff preserves commandRun identity');
