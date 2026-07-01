// B"H
/**
 * B"H
 * Compact mode is now the default voice of the tunnel.
 * The full mission storm still exists for debug/audit/full/standard modes, but
 * normal humans and agents receive a small compass: what happened, what next,
 * why trust it, and whether a mission is active.
 */
const FULL_MODES = new Set(['debug', 'full', 'audit', 'standard', 'raw']);
const BLOAT_KEYS = new Set([
  'finalAnswerAllowed', 'mustContinue', 'mustCallNext', 'checkpointMessage', 'tunnelInstruction',
  'agentGuidance', 'emergencyStopAllowedOnlyFor', 'userVisibleAnswerBlocked', 'finalAnswerBlockedReason',
  'nextRequiredToolCall', 'continuationToken', 'continuationPressure', 'continuationEscrow', 'responseFocus',
  'multipleChoiceSelfInterrogation', 'tunnelProtocol', 'missionHeartbeat', 'autoContinuationFinal',
  'autoContinuationTrace', 'autoContinuationSteps', 'workQueue'
]);

function shouldCompact(payload = {}, result = {}) {
  const mode = String(payload.responseMode || result.responseMode || '').toLowerCase();
  if (FULL_MODES.has(mode)) return false;
  return true;
}

function compactMissionSurface(result = {}, payload = {}) {
  if (!shouldCompact(payload, result)) return result;
  const out = { ...result };
  const mission = compactMission(out);
  const debugRef = detailsRef(out);
  for (const key of BLOAT_KEYS) delete out[key];
  out.mission = mission;
  if (debugRef) out.detailsRef = debugRef;
  out.responseShape = 'compact-envelope-v1';
  return out;
}

function compactMission(source = {}) {
  const nextCall = source.nextRequiredToolCall || source.mustCallNext || source.responseFocus?.nextRequiredToolCall || null;
  const active = Boolean(source.missionLockActive || source.mustContinue || source.mission?.active || nextCall);
  return clean({
    active,
    next: nextCall ? `Call ${nextCall.action} next.` : source.summary || source.next || 'Continue with the next safe action.',
    nextRequiredToolCall: nextCall || undefined,
    engagementRequired: Boolean(nextCall || source.mustContinue),
    why: source.finalAnswerBlockedReason || source.continuationPressure?.releaseBlockedBecause || undefined,
    detailsRef: detailsRef(source)
  });
}

function detailsRef(source = {}) { return source.outputRef || source.actionId || source.detailsRef || undefined; }
function clean(obj) { for (const k of Object.keys(obj)) if (obj[k] === undefined || obj[k] === '') delete obj[k]; return obj; }
module.exports = { compactMissionSurface, shouldCompact, compactMission, FULL_MODES };
