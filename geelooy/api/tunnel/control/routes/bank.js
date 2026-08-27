// B"H
const { html, json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { PLANS, PURCHASE_URL, usageSummary } = require("../core/usageStore.js");
const { readStore } = require("../core/store.js");
const { bankPage } = require("../views/computePage.js");
const economy = require("../../../perutas/index.js");

/** B"H: The bank is the account's living ledger, purchase history, and receipt shelf. */
async function bank($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error, purchaseUrl: PURCHASE_URL, plans: PLANS }, 401);
  const GET = $i?.paramKinds?.GET || {};
  const usage = usageSummary(ident.userId);
  const history = economy.purchase.history(readStore(), ident.userId);
  const data = { BH: "B\"H", ok: true, usage, history, plans: PLANS, purchaseUrl: PURCHASE_URL };
  if (GET.format === "json" || GET.json === "1") return json($i, data);
  return html($i, bankPage({ ident, usage, history }));
}
module.exports = { bank };
