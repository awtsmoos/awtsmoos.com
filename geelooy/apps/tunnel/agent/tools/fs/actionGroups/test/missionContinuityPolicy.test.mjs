// B"H
import assert from 'node:assert/strict';
import Policy from '../../mission/continuity/policy.js';

const lock = { missionId:'mission_test', lastMustCallNext:{ action:'missionNext', missionId:'mission_test' } };
const denied = Policy.enforce(lock, { ok:true, done:true, finalAnswerAllowed:true }, {});
assert.equal(denied.finalAnswerAllowed, false);
assert.equal(denied.mustContinue, true);
assert.equal(denied.continuityCheckpoint, true);
assert.equal(denied.mustCallNext.action, 'missionNext');
assert.match(denied.tunnelInstruction, /Do not end/);

const stopped = Policy.enforce(lock, { ok:true, done:true, finalAnswerAllowed:true }, { action:'missionStop', confirm:true });
assert.equal(stopped.finalAnswerAllowed, true);
console.log('mission continuity policy ok');
