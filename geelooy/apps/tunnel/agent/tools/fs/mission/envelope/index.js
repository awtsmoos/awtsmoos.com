// B"H
const Next = require('./next.js');
const Friendly = require('./friendly.js');
const Covenant = require('../continuationCovenant.js');
const Sanitize = require('./sanitize.js');
const Heartbeat = require('./heartbeat.js');
const Gate = require('../continuationGate/index.js');
function shouldWrap(lock, result = {}, payload = {}) {
  if (!lock || lock.releaseAllowed === true) return false;
  if (Covenant.exceptionStop(payload) || Covenant.exceptionStop(result)) return false;
  return result.finalAnswerAllowed === true || result.mustContinue === true || !result.mustCallNext;
}
function wrap(lock, result = {}, payload = {}) {
  if (!shouldWrap(lock, result, payload)) return finish(lock, result, result.mustCallNext);
  const mustCallNext = Next.next(lock, result, payload);
  const guidance = Friendly.agentGuidance(mustCallNext, result);
  const wrapped = { ...result, finalAnswerAllowed:false, mustContinue:true, missionLockActive:true,
    mustCallNext, checkpointMessage:'Checkpoint reached. Keep the mission moving with the next safe useful step.',
    tunnelInstruction:guidance.plainEnglish, agentGuidance:guidance,
    emergencyStopAllowedOnlyFor:['verified user stop','safety block','tool loss','fatal corruption','lease expiry','explicit testing emergency'] };
  return finish(lock, wrapped, mustCallNext);
}
function finish(lock, result, next) { return Heartbeat.ensure(lock, Sanitize.apply(Gate.gate(lock, result, next), next), next); }
module.exports = { wrap, shouldWrap, Next, Friendly, Sanitize, Heartbeat, Gate };
