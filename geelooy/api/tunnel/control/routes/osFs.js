// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");
const { attachActionGuidance } = require("../core/actionGuidance.js");

function responseBytes(obj) {
  try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); }
  catch (_) { return 0; }
}

function identityAllows(ident, neededScope) {
  if (ident.kind === "session") return true;
  return scopeAllowed(ident, neededScope) ||
    scopeAllowed(ident, "tunnel.admin") ||
    scopeAllowed(ident, "awtsmoos.os");
}

async function osFs($i) {
  const ident = currentIdentity($i);
  const payload = buildFsPayload($i);
  if (!ident.ok) return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: "not_authenticated" }, payload), 401);
  const neededScope = actionRequiredScope(payload.action);
  if (!identityAllows(ident, neededScope)) return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: "missing_scope", neededScope }, payload), 403);

  const rate = enforceApiKeyRate(ident, 0);
  if (!rate.ok) return json($i, attachActionGuidance({ BH: "B\"H", ok: false, error: rate.error, limit: rate.limit }, payload), 429);

  try {
    const { dispatchOsFs } = require("./osFs/index.js");
    const result = attachActionGuidance(await dispatchOsFs($i, ident.userId, payload), payload);

    recordUsage({
      userId: ident.userId,
      keyId: ident.keyId || null,
      action: `awtsmoos-os:${payload.action}`,
      path: payload.path,
      bytes: responseBytes(result),
      ok: result.ok !== false
    });

    return json($i, result, result.status || 200);
  } catch (e) {
    recordUsage({
      userId: ident.userId,
      keyId: ident.keyId || null,
      action: `awtsmoos-os:${payload.action}`,
      path: payload.path,
      ok: false
    });

    return json($i, attachActionGuidance({
      BH: "B\"H",
      ok: false,
      error: "awtsmoos_os_unavailable",
      message: e.message,
      aliasId: e.aliasId || null
    }, payload), e.status || 503);
  }
}

module.exports = { osFs };