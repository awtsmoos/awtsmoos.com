// B"H
const { loadConfig } = require('../config.js');
const C = require('./correlation.js');
const A = require('./aliases.js');
function responseEnvelope(data = {}, payload = {}, result, enqueuedAt, stats) {
  const safe = result && typeof result === 'object' ? { ...result } : { ok: true, value: result };
  const requestAction = String(payload.action || safe.requestAction || safe.action || '');
  const rawAction = String(safe.action || '');
  if (missionHijack(requestAction, rawAction, safe)) {
    safe.mission = { ...(safe.mission || {}), identityGuard: { preventedTopLevelAction: rawAction, requestAction } };
    if (!safe.autoContinuationFinal) safe.autoContinuationFinal = { action: rawAction };
    safe.action = requestAction;
  }
  const finalAction = String(safe.action || requestAction || rawAction || '');
  const actualAction = String(safe.actualAction || finalAction || requestAction || '');
  const actionMismatch = Boolean(requestAction && finalAction && requestAction !== finalAction && !A.allowed(requestAction, finalAction));
  for (const key of ['type', 'id', 'controlRequestId', 'queueStats', 'queuedMs']) delete safe[key];
  return {
    ...safe,
    type: 'TUNNEL_RESPONSE',
    id: data.id,
    ...C.fields({ ...payload, tunnelName: payload.tunnelName || loadConfig().tunnelName, requestedTunnelName: payload.requestedTunnelName || payload.tunnelName || '' }),
    action: finalAction,
    requestAction,
    actualAction,
    actionMismatch,
    queuedMs: Math.max(0, Date.now() - enqueuedAt),
    queueStats: stats()
  };
}
function missionHijack(requestAction, rawAction, result = {}) {
  if (!requestAction || !rawAction || requestAction === rawAction) return false;
  if (!rawAction.startsWith('mission') && !rawAction.startsWith('actionHistory')) return false;
  return result.requestAction === requestAction || result.originalAction === requestAction ||
    !!result.autoContinuationFinal || !!result.mission || !!result.mustCallNext || !!result.nextRequiredToolCall;
}
module.exports = { responseEnvelope, missionHijack };
