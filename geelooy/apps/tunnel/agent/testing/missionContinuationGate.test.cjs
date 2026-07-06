// B"H
const assert = require('assert');
const Envelope = require('../tools/fs/mission/envelope/index.js');
const Gate = require('../tools/fs/mission/continuationGate/index.js');
const lock = { missionId:'m1', lastMustCallNext:{ action:'missionNext', missionId:'m1' } };
const got = Envelope.wrap(lock, { ok:true, action:'commandRun' }, { action:'commandRun' });
assert.equal(got.finalAnswerAllowed, true);
assert.equal(got.mustContinue, false);
assert.equal(got.userVisibleAnswerBlocked, false);
assert.equal(got.nextRequiredToolCall, undefined);
assert.equal(got.nextSuggestedToolCall.action, 'missionNext');
assert.equal(got.continuationEscrow.held, false);
assert.equal(got.tunnelProtocol.hardContinuationGate, false);
assert.equal(got.tunnelProtocol.mayAnswerUser, true);
assert.doesNotThrow(() => Gate.gate(null, { mustContinue:true }, null));
console.log(JSON.stringify({ ok:true, suite:'mission-continuation-gate-advisory' }, null, 2));
