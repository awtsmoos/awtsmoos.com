// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore, writeStore } = require("../core/store.js");
const economy = require("../../../perutas/index.js");

/** B"H: Marketplace simulation route; settlement is ledger-backed and local. */
async function marketplace($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const q = $i?.paramKinds?.GET || {};
  const store = readStore();
  let result = null;
  if (q.action === "list") result = economy.marketplace.listService(store, ident.userId, { id: q.id, title: q.title, agentId: q.agentId, organizationId: q.orgId, price: amounts(q) });
  else if (q.action === "buy") result = economy.marketplace.purchase(store, ident.userId, q.serviceId, { source: "sandbox" });
  else result = economy.marketplace.summary(store);
  writeStore(store);
  return json($i, { BH: "B\"H", ok: true, result, summary: economy.marketplace.summary(store) });
}
function amounts(q) { return { routing: Number(q.routing || q.amount || 1000), compute: Number(q.compute || 50), storage: Number(q.storage || 0), gpu: Number(q.gpu || 0) }; }
module.exports = { marketplace };
