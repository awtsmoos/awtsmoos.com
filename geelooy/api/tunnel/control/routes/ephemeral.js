// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { deleteEphemeral, getDescriptor, listEphemeral, pageEphemeral, searchEphemeral } = require("../core/ephemeralStore.js");

function params($i) { return { ...($i?.paramKinds?.GET || {}), ...($i?.paramKinds?.POST || {}) }; }
function idFrom(vars = {}, p = {}) { return String(vars.resultId || p.resultId || p.id || p.resultRef || "").replace(/^awtsmoos:\/\/turn-result\//, ""); }
function auth($i) { const ident = currentIdentity($i); return ident.ok ? null : { BH: "B\"H", ok: false, error: ident.error || "not_authenticated" }; }

/**
 * B"H
 * Chapter: The AI result river gained page, search, and delete gates.
 */
async function ephemeralMeta($i, vars = {}) {
  const denied = auth($i); if (denied) return json($i, denied, 401);
  const got = getDescriptor(idFrom(vars, params($i)));
  return json($i, got ? { BH: "B\"H", ok: true, ephemeral: got } : { BH: "B\"H", ok: false, error: "ephemeral_not_found_or_expired" }, got ? 200 : 404);
}

async function ephemeralPage($i, vars = {}) {
  const denied = auth($i); if (denied) return json($i, denied, 401);
  const p = params($i);
  const got = pageEphemeral(idFrom(vars, p), p);
  return json($i, got || { BH: "B\"H", ok: false, error: "ephemeral_not_found_or_expired" }, got ? 200 : 404);
}

async function ephemeralSearch($i, vars = {}) {
  const denied = auth($i); if (denied) return json($i, denied, 401);
  const p = params($i);
  const got = searchEphemeral(idFrom(vars, p), p.query || p.q || p.find || "", p);
  return json($i, got || { BH: "B\"H", ok: false, error: "ephemeral_not_found_or_expired" }, got ? 200 : 404);
}

async function ephemeralDelete($i, vars = {}) {
  const denied = auth($i); if (denied) return json($i, denied, 401);
  return json($i, { BH: "B\"H", ...deleteEphemeral(idFrom(vars, params($i))) });
}

async function ephemeralList($i) {
  const denied = auth($i); if (denied) return json($i, denied, 401);
  return json($i, { BH: "B\"H", ok: true, ephemeral: listEphemeral() });
}

module.exports = { ephemeralMeta, ephemeralPage, ephemeralSearch, ephemeralDelete, ephemeralList };
