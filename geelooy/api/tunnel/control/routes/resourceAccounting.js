// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore, writeStore } = require("../core/store.js");
const economy = require("../../../perutas/index.js");

/** B"H: Route for measured CPU/RAM/storage/network/GPU accounting. */
async function resourceAccounting($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const q = $i?.paramKinds?.GET || {};
  const store = readStore();
  const result = q.action === "record"
    ? { ok: true, entry: economy.resources.record(store, ident.userId, q) }
    : economy.resources.summary(store, ident.userId);
  writeStore(store);
  return json($i, { BH: "B\"H", ...result });
}
module.exports = { resourceAccounting };
