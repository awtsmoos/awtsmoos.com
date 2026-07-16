// B"H
const { loadConfig } = require('../config.js');
const C = require('./correlation.js');
const A = require('./aliases.js');
const R = require('./recovery-envelope.js');
const Compact = require('./envelope-compact.js');
const Surface = require('./response-surface.js');
function responseEnvelope(data = {}, payload = {}, result, enqueuedAt, stats) {
  const safe = normalizeResult(result);
  // The relay payload may carry a database tunnel id (tun_...) in a historical
  // `tunnelName` field. Transport identity is owned by this registered runtime,
  // never by caller-controlled action data. Returning the payload value makes a
  // valid completion look as though it came from a foreign tunnel.
  const configuredTunnelName = String(loadConfig().tunnelName || '');
  const identity = R.normalizeActionIdentity({ ...payload, action: payload.action || safe.requestAction || safe.action });
  const requestAction = identity.requestAction;
  preventMissionHijack(safe, requestAction);
  const finalAction = String(safe.action || requestAction || identity.action || '');
  const actualAction = String(safe.actualAction || identity.actualAction || finalAction || requestAction || '');
  const actionMismatch = Boolean(requestAction && finalAction && requestAction !== finalAction && !A.allowed(requestAction, finalAction));
  const compact = Compact.compactMissionSurface(stripTransportFields(safe), payload);
  const full = { ...compact, type:'TUNNEL_RESPONSE', id:data.id, ...C.fields({ ...payload, tunnelName:configuredTunnelName || payload.tunnelName, requestedTunnelName:payload.requestedTunnelName || configuredTunnelName || '' }), action:finalAction, requestAction, actualAction, actionMismatch, queuedMs:Math.max(0, Date.now()-enqueuedAt), queueStats:stats() };
  return Surface.publicEnvelope(full, payload, safe);
}
function normalizeResult(result){return result&&typeof result==='object'?{...result}:{ok:true,value:result};}
function stripTransportFields(safe){const copy={...safe};for(const key of ['type','id','controlRequestId','queueStats','queuedMs'])delete copy[key];return copy;}
function preventMissionHijack(safe,requestAction){const rawAction=String(safe.action||'');if(!missionHijack(requestAction,rawAction,safe))return;safe.mission={...(safe.mission||{}),identityGuard:{preventedTopLevelAction:rawAction,requestAction}};if(!safe.autoContinuationFinal)safe.autoContinuationFinal={action:rawAction};safe.action=requestAction;}
function missionHijack(requestAction,rawAction,result={}){if(!requestAction||!rawAction||requestAction===rawAction)return false;if(!rawAction.startsWith('mission')&&!rawAction.startsWith('actionHistory'))return false;return result.requestAction===requestAction||result.originalAction===requestAction||!!result.autoContinuationFinal||!!result.mission||!!result.mustCallNext||!!result.nextRequiredToolCall;}
module.exports={responseEnvelope,missionHijack};
