// B"H
const Focus = require('./mission/response/compact.js');
const Lock = require('./mission/lock/index.js');
const Court = require('./mission/releaseCourt/index.js');
const Receipts = require('./mission/toolReceipts/index.js');
const StopAudit = require('./mission/stopAudit/index.js');
const Final = require('./mission/finalInterceptor/index.js');
const Envelope = require('./mission/envelope/index.js');
function firewallBlock(action, firewallResult, active = {}, payload = {}) {
  // A firewall denial has not run the requested action. The next step must
  // authorize THAT exact action, not replay an unrelated planning checkpoint.
  if (firewallResult.error === "mission_step_authorization_required" &&
      firewallResult.missionWriteToken) {
    const retry = {
      action,
      path: String(payload.path || payload.p || ""),
      missionId: firewallResult.missionId || active.missionId,
      missionWriteToken: firewallResult.missionWriteToken
    };
    return Focus.compact({
      ok: false, action, ...firewallResult,
      finalAnswerAllowed: false, mustContinue: true,
      mustCallNext: retry, nextRequiredToolCall: retry,
      retryPayload: retry, executionCompleted: false,
      authorizationRetry: {
        safeToRetry: true,
        originalActionNotExecuted: true,
        originalPayloadRequired: true,
        instructions: "Resubmit the original action and content unchanged, adding missionWriteToken from retryPayload. Use a new request ID only after this terminal denial; do not repeat a pending action."
      }
    }, payload);
  }
  return Focus.compact({
    ok:false, action, ...firewallResult, finalAnswerAllowed:false,
    mustContinue:true, mustCallNext:active.lastMustCallNext
  }, payload);
}
/**
 * B"H — Every action leaves through one friendly gate.
 * The envelope cooperates with the agent: it permits steering and rare
 * emergency stop receipts, while preventing accidental mission silence.
 */
function finishAction(config, payload, result) {
  const beforeLock = Lock.active(config);
  let output = Court.guard(config, beforeLock, result, payload);
  output = Envelope.wrap(beforeLock, output, payload);
  output = Final.intercept(beforeLock, output, payload);
  const stopAudit = StopAudit.after(config, beforeLock, output);
  const lock = Lock.after(config, payload, output);
  const receipt = Receipts.after(config, payload, output);
  if (lock && String(output.action || '').startsWith('mission')) output.releaseStatus = lock.releaseStatus || 'locked';
  if (receipt) output.missionToolReceipt = receipt;
  if (stopAudit) output.stopAudit = stopAudit;
  return Focus.compact(output, payload);
}
module.exports = { finishAction, firewallBlock };
