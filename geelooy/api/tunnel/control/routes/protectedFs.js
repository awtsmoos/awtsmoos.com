// B"H
const { json } = require('../core/respond.js');
const { currentIdentity } = require('../core/auth.js');
const { buildFsPayload, actionRequiredScope } = require('../core/tunnelPayload.js');
const { scopeAllowed, enforceApiKeyRate } = require('../core/apiKeyStore.js');
const { recordUsage } = require('../core/usageStore.js');
const { autoCreatePreviewResult } = require('../preview/previewAutoCreate.js');
const { resolveFsVessel } = require('./fsVessel/resolveFsVessel.js');
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_SAFE_ACTIONS = new Set(['list', 'tree', 'read', 'readLines', 'readManyLines', 'readBytes', 'read64', 'md', 'stat', 'roots', 'rootBrowse', 'configGet', 'payloadEcho', 'actionSchemaTrace', 'actionHistoryList', 'actionHistoryGet', 'actionHistorySearch', 'actionHistoryExplain', 'actionHistoryDiff', 'chromeStatus', 'missionTimeline']);
function responseBytes(obj) { try { return Buffer.byteLength(JSON.stringify(obj), 'utf8'); } catch { return 0; } }
function mayUseSessionForDashboard(payload) { return SESSION_SAFE_ACTIONS.has(payload.action); }
function payloadEcho(payload) { return { BH:'B"H', ok:true, action:'payloadEcho', requestAction:'payloadEcho', actualAction:'payloadEcho', payload }; }
function normalizeCarriers(body = {}, $i = {}) { const paramKinds = { ...($i.paramKinds || {}), POST:{ ...($i.paramKinds?.POST || {}), ...body } }; return buildFsPayload({ ...$i, paramKinds, $_POST:paramKinds.POST }); }
function explicitTrue(value) { return value === true || value === 'true' || value === 1 || value === '1'; }
function withDefaultPreviewOff(payload = {}) { return payload.autoPreview === undefined ? { ...payload, autoPreview:false } : payload; }
async function protectedFs($i, vars) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH:'B"H', ok:false, error:ident.error || 'not_authenticated', help:'Log in, use OAuth Bearer token, or use x-awtsmoos-api-key.' }, 401);
  const payload = withDefaultPreviewOff(buildFsPayload($i));
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
    const out = explicitTrue(payload.autoPreview) ? autoCreatePreviewResult(ident, payload, rawOut) : rawOut;
    recordUsage({ userId:ident.userId, keyId:ident.keyId || null, action:payload.action, path:payload.path || payload.cwd || payload.url || null, bytes:responseBytes(out), ok:out.ok !== false });
    return json($i, out && typeof out === 'object' ? out : { BH:'B"H', ok:false, error:'empty_tunnel_response' }, out?.status || 200);
  } catch (e) {
    recordUsage({ userId:ident.userId, keyId:ident.keyId || null, action:payload.action, path:payload.path || payload.cwd || payload.url || null, ok:false });
    return json($i, { BH:'B"H', ok:false, error:e.message, stack:e.stack }, e.status || 500);
  }
}
function boundedTunnelTimeout(value) {
  const parsed = Number(value || 30000);
  const timeout = Number.isFinite(parsed) ? parsed : 30000;
  if (timeout > ONE_DAY_MS) throw new Error('timeout_too_large');
  return Math.max(1000, Math.floor(timeout));
}
module.exports = { ONE_DAY_MS, boundedTunnelTimeout, protectedFs, normalizeCarriers, withDefaultPreviewOff, explicitTrue };
/** B"H: previews are now opt-in at the route boundary; tunnel responses stay small by default. */
