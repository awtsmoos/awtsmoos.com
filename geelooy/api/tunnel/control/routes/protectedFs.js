// B"H
const { json } = require('../core/respond.js');
const { currentIdentity } = require('../core/auth.js');
const { buildFsPayload, actionRequiredScope } = require('../core/tunnelPayload.js');
const { scopeAllowed, enforceApiKeyRate } = require('../core/apiKeyStore.js');
const { recordUsage } = require('../core/usageStore.js');
const { autoCreatePreviewResult } = require('../preview/previewAutoCreate.js');
const { resolveFsVessel } = require('./fsVessel/resolveFsVessel.js');

const SESSION_SAFE_ACTIONS = new Set(['list', 'tree', 'read', 'readLines', 'readManyLines', 'readBytes', 'read64', 'md', 'stat', 'roots', 'rootBrowse', 'configGet', 'payloadEcho', 'actionSchemaTrace', 'actionHistoryList', 'actionHistoryGet', 'actionHistorySearch', 'actionHistoryExplain', 'actionHistoryDiff', 'chromeStatus', 'missionTimeline']);
function responseBytes(obj) { try { return Buffer.byteLength(JSON.stringify(obj), 'utf8'); } catch { return 0; } }
function mayUseSessionForDashboard(payload) { return SESSION_SAFE_ACTIONS.has(payload.action); }
function payloadEcho(payload) { return { BH:'B"H', ok:true, action:'payloadEcho', requestAction:'payloadEcho', actualAction:'payloadEcho', payload }; }
function normalizeCarriers(body = {}, $i = {}) { const paramKinds = { ...($i.paramKinds || {}), POST:{ ...($i.paramKinds?.POST || {}), ...body } }; return buildFsPayload({ ...$i, paramKinds, $_POST:paramKinds.POST }); }

async function protectedFs($i, vars) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH:'B"H', ok:false, error:ident.error || 'not_authenticated', help:'Log in, use OAuth Bearer token, or use x-awtsmoos-api-key.' }, 401);
  const payload = buildFsPayload($i);
  payload.tunnelName = vars.tunnelName || payload.tunnelName || 'auto';
  if (payload.payloadError) return json($i, { BH:'B"H', ok:false, error:payload.payloadError, action:payload.action }, 400);
  if (payload.action === 'payloadEcho') return json($i, payloadEcho(payload), 200);
  if (ident.kind === 'session' && !mayUseSessionForDashboard(payload)) return json($i, { BH:'B"H', ok:false, error:'api_key_or_oauth_required', details:'Write, terminal, Chrome control, replay, and host mutation actions require x-awtsmoos-api-key or OAuth. Logged-in browser sessions may browse/read their vessels.', neededScope:actionRequiredScope(payload.action) }, 401);
  const neededScope = actionRequiredScope(payload.action);
  if (ident.kind !== 'session' && !scopeAllowed(ident, neededScope) && !scopeAllowed(ident, 'tunnel.admin')) return json($i, { BH:'B"H', ok:false, error:'missing_scope', neededScope }, 403);
  const rate = enforceApiKeyRate(ident, 0);
  if (!rate.ok) return json($i, { BH:'B"H', ok:false, error:rate.error, limit:rate.limit }, 429);
  try {
    const vessel = resolveFsVessel({ $i, userId:ident.userId, tunnelName:payload.tunnelName, payload, timeoutMs:boundedTunnelTimeout(payload.timeoutMs || payload.timeout) });
    const result = await vessel.send();
    const rawOut = { ...result, requestAction:payload.action, actualAction:result?.action || result?.actualAction || '' };
    const out = autoCreatePreviewResult(ident, payload, rawOut);
    recordUsage({ userId:ident.userId, keyId:ident.keyId || null, action:payload.action, path:payload.path || payload.cwd || payload.url || null, bytes:responseBytes(out), ok:out.ok !== false });
    return json($i, out && typeof out === 'object' ? out : { BH:'B"H', ok:false, error:'empty_tunnel_response' }, out?.status || 200);
  } catch (e) {
    recordUsage({ userId:ident.userId, keyId:ident.keyId || null, action:payload.action, path:payload.path || payload.cwd || payload.url || null, ok:false });
    return json($i, { BH:'B"H', ok:false, error:e.message, stack:e.stack }, e.status || 500);
  }
}
function boundedTunnelTimeout(value) { const n = Number(value || 30000); return Math.max(1000, Math.min(Number.isFinite(n) ? n : 30000, 120000)); }
module.exports = { boundedTunnelTimeout, protectedFs, normalizeCarriers };

/** B"H: protected FS now routes native, browser, and hosted Virtual OS vessels through one resolver. */
