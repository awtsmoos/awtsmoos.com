// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore, writeStore } = require("../core/store.js");
const { amounts } = require("../core/treasuryGuards.js");
const economy = require("../../../perutas/index.js");

/** B"H: Refund route exposes simulated treasury reversals and history. */
async function refund($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const q = $i?.paramKinds?.GET || {};
  const store = readStore();
  const result = q.action === "issue"
    ? economy.refunds.issueRefund(store, ident.userId, { ...q, amounts: amounts(q) })
    : { ok: true, refunds: economy.refunds.history(store, ident.userId) };
  writeStore(store);
  return json($i, { BH: "B\"H", ...result });
}
module.exports = { refund };
