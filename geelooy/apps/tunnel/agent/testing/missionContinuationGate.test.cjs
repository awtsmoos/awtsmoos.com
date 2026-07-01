// B"H
const assert = require('assert');
const Envelope = require('../tools/fs/mission/envelope/index.js');
const lock = { missionId:'m1', lastMustCallNext:{ action:'missionNext', missionId:'m1' } };
const got = Envelope.wrap(lock, { ok:true, action:'commandRun' }, { action:'commandRun' });
assert.equal(got.finalAnswerAllowed, false);
assert.equal(got.userVisibleAnswerBlocked, true);
assert.equal(got.responseFocus.mustUseNextTool, true);
assert.equal(got.nextRequiredToolCall.action, 'missionNext');
assert.equal(got.multipleChoiceSelfInterrogation.requiredAnswer, 'call_next_required_tool');
assert.equal(got.tunnelProtocol.hardContinuationGate, true);
console.log(JSON.stringify({ ok:true, suite:'mission-continuation-gate' }, null, 2));
