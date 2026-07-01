// B"H
const assert = require('assert');
const Policy = require('../tools/fs/mission/activeGuard/policy.js');
const Block = require('../tools/fs/mission/activeGuard/block.js');
for (const action of ['tunnelDoctor','tunnelLivenessTimeline','agentDoctor','agentSelfTest','agentVersionSkewCheck','commandStatus','commandWait','commandJobOutputPage','commandCancel','missionHeartbeat','missionRecovery','missionWatchdogRecover']) {
  assert.strictEqual(Policy.allowed(action), true, action);
}
const out = Block.response('write', { missionId: 'm1', lastMustCallNext: { action: 'missionExecuteNext8', missionId: 'm1' } });
assert.strictEqual(out.action, 'write');
assert.strictEqual(out.requestAction, 'write');
assert.strictEqual(out.actualAction, 'write');
assert.strictEqual(out.error, 'mission_lock_blocks_action');
assert.strictEqual(out.mustCallNext.action, 'missionExecuteNext8');
assert.ok(out.recovery.allowedRepairActions.includes('tunnelLivenessTimeline'));
console.log('mission lock allows liveness and preserves blocked action identity');
