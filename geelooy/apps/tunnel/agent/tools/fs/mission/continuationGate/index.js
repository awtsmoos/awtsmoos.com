// B"H
const Token = require('./token.js');
const Focus = require('./focus.js');
const Pressure = require('./pressure.js');
function gate(lock = {}, result = {}, next = {}) {
  const safeNext = next || result.mustCallNext || result.nextRequiredToolCall || null;
  if (!safeNext) return allow(result, null, null);
  const continuationToken = result.continuationToken || Token.token(lock, safeNext);
  return allow(result, safeNext, continuationToken);
}
function allow(result = {}, safeNext = null, continuationToken = null) {
  return {
    ...result,
    finalAnswerAllowed: result.finalAnswerAllowed !== false,
    mustContinue:false,
    userVisibleAnswerBlocked:false,
    finalAnswerBlockedReason:undefined,
    nextSuggestedToolCall:safeNext || undefined,
    continuationToken:continuationToken || undefined,
    continuationPressure:safeNext ? Pressure.pressure(safeNext, result) : undefined,
    continuationEscrow:{ held:false, reason:'resume_available_not_mandatory' },
    responseFocus:safeNext ? Focus.responseFocus(safeNext, continuationToken) : result.responseFocus,
    tunnelProtocol:{ ...(result.tunnelProtocol || {}), hardContinuationGate:false, mayAnswerUser:true, mustCallNext:false }
  };
}
/** B"H — The token became a bookmark instead of a chain. */
module.exports = { gate, responseFocus:Focus.responseFocus, selfCheck:Focus.selfCheck };
