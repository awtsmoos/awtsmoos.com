// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { PLANS, PURCHASE_URL, usageSummary } = require("../core/usageStore.js");

async function usage($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error, purchaseUrl: PURCHASE_URL, plans: PLANS }, 401);
  return json($i, { BH: "B\"H", ok: true, purchaseUrl: PURCHASE_URL, plans: PLANS, usage: usageSummary(ident.userId) });
}

module.exports = { usage };
