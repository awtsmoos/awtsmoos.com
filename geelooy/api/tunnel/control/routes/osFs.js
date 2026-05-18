// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { buildFsPayload, actionRequiredScope } = require("../core/tunnelPayload.js");
const { scopeAllowed, enforceApiKeyRate } = require("../core/apiKeyStore.js");
const { recordUsage } = require("../core/usageStore.js");
const { dispatchOsFs } = require("./osFs/index.js");

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

/**
 * B"H
 * Hosted Awtsmoos OS filesystem route.
 *
 * This is the third tunnel mode: no local install, no editor tab relay.
 * The root is the signed-in user's aliases; every alias is a writable root.
 */
async function osFs($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);

  const payload = buildFsPayload($i);
  const neededScope = actionRequiredScope(payload.action);
  if (!identityAllows(ident, neededScope)) return json($i, { BH: "B\"H", ok: false, error: "missing_scope", neededScope }, 403);

  const rate = enforceApiKeyRate(ident, 0);
  if (!rate.ok) return json($i, { BH: "B\"H", ok: false, error: rate.error, limit: rate.limit }, 429);

  try {
    const result = await dispatchOsFs($i, ident.userId, payload);
    recordUsage({ userId: ident.userId, keyId: ident.keyId || null, action: `awtsmoos-os:${payload.action}`, path: payload.path, bytes: responseBytes(result), ok: result.ok !== false });
    return json($i, result, result.status || 200);
  } catch (e) {
    recordUsage({ userId: ident.userId, keyId: ident.keyId || null, action: `awtsmoos-os:${payload.action}`, path: payload.path, ok: false });
    return json($i, { BH: "B\"H", ok: false, error: e.message, stack: e.stack, aliasId: e.aliasId || null }, e.status || 500);
  }
}

module.exports = { osFs };
