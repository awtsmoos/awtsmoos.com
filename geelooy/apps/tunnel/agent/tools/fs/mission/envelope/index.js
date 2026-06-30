// B"H
const Next = require('./next.js');
const Friendly = require('./friendly.js');
const Covenant = require('../continuationCovenant.js');
const Sanitize = require('./sanitize.js');
const Heartbeat = require('./heartbeat.js');
function shouldWrap(lock, result = {}, payload = {}) {
  if (!lock || lock.releaseAllowed === true) return false;
  if (Covenant.exceptionStop(payload) || Covenant.exceptionStop(result)) return false;
  return result.finalAnswerAllowed === true || result.mustContinue === true || !result.mustCallNext;
}
/** B"H — Friendly hard envelope: steer freely, do not vanish accidentally. */
function wrap(lock, result = {}, payload = {}) {
  if (!shouldWrap(lock, result, payload)) {
    return Heartbeat.ensure(lock, Sanitize.apply(result, result.mustCallNext), result.mustCallNext);
  }
  const mustCallNext = Next.next(lock, result, payload);
  const guidance = Friendly.agentGuidance(mustCallNext, result);
  const wrapped = { ...result, finalAnswerAllowed:false, mustContinue:true, missionLockActive:true,
    mustCallNext, checkpointMessage:'Checkpoint reached. Keep the mission moving with the next safe useful step.',
    tunnelInstruction:guidance.plainEnglish, agentGuidance:guidance,
    emergencyStopAllowedOnlyFor:['verified user stop','safety block','tool loss','fatal corruption','lease expiry','explicit testing emergency'] };
  return Heartbeat.ensure(lock, Sanitize.apply(wrapped, mustCallNext), mustCallNext);
}
module.exports = { wrap, shouldWrap, Next, Friendly, Sanitize, Heartbeat };
