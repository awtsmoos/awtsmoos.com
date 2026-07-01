// B"H
const Token = require('./token.js');
const Focus = require('./focus.js');
function gate(lock = {}, result = {}, next = {}) {
  if (result.finalAnswerAllowed === true || result.mustContinue !== true) return result;
  const safeNext = next || result.mustCallNext || result.nextRequiredToolCall || {};
  const continuationToken = result.continuationToken || Token.token(lock, safeNext);
  return { ...result, finalAnswerAllowed:false, userVisibleAnswerBlocked:true, finalAnswerBlockedReason:'mission_must_continue',
    nextRequiredToolCall:safeNext, continuationToken, continuationEscrow:{ held:true, reason:'final_answer_blocked_until_release', releaseRequires:'finalAnswerAllowed:true' },
    responseFocus:Focus.responseFocus(safeNext, continuationToken), multipleChoiceSelfInterrogation:Focus.selfCheck(safeNext),
    tunnelProtocol:{ ...(result.tunnelProtocol || {}), hardContinuationGate:true, mayAnswerUser:false, mustCallNext:true } };
}
/** B"H — The unfinished mission becomes the shape of the response itself. */
module.exports = { gate, responseFocus:Focus.responseFocus, selfCheck:Focus.selfCheck };
