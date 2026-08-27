// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore, writeStore } = require("../core/store.js");
const { audit } = require("../core/auditLog.js");
const economy = require("../../../perutas/index.js");

/** B"H: Provider route previews, authorizes, captures, refunds, renews, cancels. */
async function provider($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const q = $i?.paramKinds?.GET || {};
  const store = readStore();
  const result = economy.provider.run(store, ident.userId, q.action || "preview", q);
  audit(store, { userId: ident.userId, kind: "provider_route", action: q.action || "preview", provider: result.provider });
  writeStore(store);
  return json($i, { BH: "B\"H", ...result, history: economy.provider.history(store, ident.userId) });
}
module.exports = { provider };
