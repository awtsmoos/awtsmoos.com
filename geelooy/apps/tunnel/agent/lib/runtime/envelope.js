// B"H
const { loadConfig } = require('../config.js');
const C = require('./correlation.js');
const A = require('./aliases.js');
function responseEnvelope(data, payload, result, enqueuedAt, stats) { const safe = result && typeof result === 'object' ? { ...result } : { ok:true, value:result }; const actualAction = String(safe.action || ''), requestAction = String(payload?.action || ''); const actionMismatch = Boolean(requestAction && actualAction && requestAction !== actualAction && !A.allowed(requestAction, actualAction)); for (const k of ['type','id','controlRequestId','queueStats','queuedMs']) delete safe[k]; return { ...safe, type:'TUNNEL_RESPONSE', id:data.id, ...C.fields({ ...payload, tunnelName:payload?.tunnelName || loadConfig().tunnelName, requestedTunnelName:payload?.requestedTunnelName || payload?.tunnelName || '' }), requestAction, actualAction, actionMismatch, queuedMs:Math.max(0, Date.now() - enqueuedAt), queueStats:stats() }; }
module.exports = { responseEnvelope };
