// B"H
const FULL_MODES = new Set(['debug', 'full', 'audit', 'standard', 'raw']);
const BLOAT_KEYS = new Set([
  'mustCallNext','checkpointMessage','tunnelInstruction','agentGuidance','emergencyStopAllowedOnlyFor',
  'userVisibleAnswerBlocked','finalAnswerBlockedReason','nextRequiredToolCall','nextSuggestedToolCall',
  'continuationPressure','continuationEscrow','responseFocus','multipleChoiceSelfInterrogation',
  'tunnelProtocol','missionHeartbeat','autoContinuationFinal','autoContinuationTrace','autoContinuationSteps','workQueue'
]);
function shouldCompact(payload = {}, result = {}) {
  const mode = String(payload.responseMode || result.responseMode || '').toLowerCase();
  return !FULL_MODES.has(mode);
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
  const advisory = source.missionAdvisory || {};
  const nextCall = source.nextRequiredToolCall || source.mustCallNext || source.nextSuggestedToolCall || advisory.suggestedNext || null;
  const active = Boolean(advisory.active || source.mission?.active || source.missionStatus?.active);
  const blocked = source.userVisibleAnswerBlocked === true || source.finalAnswerAllowed === false;
  return clean({
    active,
    advisory: active && !blocked,
    resumeAvailable: Boolean(active && (advisory.resumeAvailable !== false)),
    next: nextCall ? `Resume available via ${nextCall.action}.` : source.summary || source.next || 'Continue with the next safe action.',
    nextSuggestedToolCall: nextCall || undefined,
    engagementRequired: false,
    why: blocked ? (source.finalAnswerBlockedReason || 'explicit_block') : undefined,
    detailsRef: detailsRef(source)
  });
}
function detailsRef(source = {}) { return source.outputRef || source.actionId || source.detailsRef || undefined; }
function clean(obj) { for (const k of Object.keys(obj)) if (obj[k] === undefined || obj[k] === '') delete obj[k]; return obj; }
module.exports = { compactMissionSurface, shouldCompact, compactMission, FULL_MODES };
