// B"H
const assert = require('assert');
const Envelope = require('../tools/fs/mission/envelope/index.js');
(() => {
  const lock = { missionId:'mission_alive', releaseAllowed:false, lastMustCallNext:{ action:'missionCycle', missionId:'mission_alive' } };
  const wrapped = Envelope.wrap(lock, { ok:true, action:'commandRun', finalAnswerAllowed:true }, { action:'commandRun' });
  assert.equal(wrapped.finalAnswerAllowed, false);
  assert.equal(wrapped.mustContinue, true);
  assert.equal(wrapped.mustCallNext.action, 'missionCycle');
  assert.match(wrapped.agentGuidance.plainEnglish, /mission is still active|continue/i);
  assert.equal(wrapped.agentGuidance.canSteer, true);
  const emergency = Envelope.wrap(lock, { ok:true, action:'test', finalAnswerAllowed:true }, { emergencyStop:true, testing:true, reason:'test harness needs controlled stop' });
  assert.equal(emergency.finalAnswerAllowed, true);
  const released = Envelope.wrap({ ...lock, releaseAllowed:true }, { ok:true, finalAnswerAllowed:true }, {});
  assert.equal(released.finalAnswerAllowed, true);
  console.log(JSON.stringify({ ok: true, suite: 'mission-envelope-enforcement' }, null, 2));
})();
