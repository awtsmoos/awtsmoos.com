// B"H
const FULL_MODES = new Set(['debug', 'full', 'audit', 'standard', 'raw']);
const BLOAT_KEYS = new Set([
  'mustCallNext','checkpointMessage','tunnelInstruction','agentGuidance','emergencyStopAllowedOnlyFor',
  'userVisibleAnswerBlocked','finalAnswerBlockedReason','nextRequiredToolCall','nextSuggestedToolCall',
  'continuationPressure','continuationEscrow','responseFocus','multipleChoiceSelfInterrogation',
  'tunnelProtocol','missionHeartbeat','autoContinuationFinal','autoContinuationTrace','autoContinuationSteps','workQueue'
]);
const FS_RESULT_KEYS = new Set(['content','items','entries','files','dirs','absolutePath','returnedChars','totalChars','hasNextPage','nextOffsetChars','nextPagePayload','statusPayload','waitPayload','stdoutPagePayload','stderrPagePayload','count','results','result','errors','diagnostics']);
const MISSION_ACTION = /^(mission|actionHistory)/;
function shouldCompact(payload = {}, result = {}) {
  const mode = String(payload.responseMode || result.responseMode || '').toLowerCase();
  return !FULL_MODES.has(mode);
}
function hasFsPayload(result = {}) {
  return Object.keys(result || {}).some(k => FS_RESULT_KEYS.has(k));
}
function compactMissionSurface(result = {}, payload = {}) {
  if (!shouldCompact(payload, result)) return result;
  const out = { ...result };
  const action = String(out.action || payload.action || '');
  const shouldAttachMission = MISSION_ACTION.test(action) || !!out.missionAdvisory || !!out.nextRequiredToolCall || !!out.mustCallNext || out.userVisibleAnswerBlocked === true;
  const mission = shouldAttachMission && !hasFsPayload(out) ? compactMission(out) : undefined;
  const debugRef = detailsRef(out);
  for (const key of BLOAT_KEYS) delete out[key];
  if (mission) out.mission = mission;
  else delete out.mission;
  if (debugRef) out.detailsRef = debugRef;
  out.responseShape = 'compact-envelope-v2';
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
module.exports = { compactMissionSurface, shouldCompact, compactMission, hasFsPayload, FULL_MODES };
