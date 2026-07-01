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
  return true;
}
function wrap(lock, result = {}, payload = {}) {
  if (!shouldWrap(lock, result, payload)) return result;
  const suggestedNext = Next.next(lock, result, payload);
  const guidance = Friendly.agentGuidance(suggestedNext, result);
  const wrapped = {
    ...result,
    finalAnswerAllowed: result.finalAnswerAllowed !== false,
    mustContinue:false,
    missionLockActive:false,
    nextSuggestedToolCall:suggestedNext,
    checkpointMessage:'Mission snapshot available. Foreground work may continue normally.',
    tunnelInstruction:'Mission is advisory; answer the user or continue work without a required mission call.',
    agentGuidance:{ ...guidance, purpose:'advise', mustCallNext:false },
    missionAdvisory:{ active:true, blocked:false, resumeAvailable:true, suggestedNext, missionId:lock.missionId }
  };
  return finish(lock, wrapped, suggestedNext);
}
function finish(lock, result, next) { return Heartbeat.ensure(lock, Sanitize.apply(Gate.gate(lock, result, next), next), next); }
module.exports = { wrap, shouldWrap, Next, Friendly, Sanitize, Heartbeat, Gate };
