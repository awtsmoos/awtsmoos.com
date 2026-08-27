// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore, writeStore } = require("../core/store.js");
const economy = require("../../../perutas/index.js");

/** B"H: Local organization economy route; no live restart required for disk tests. */
async function organization($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const q = $i?.paramKinds?.GET || {};
  const store = readStore();
  let result = null;
  if (q.action === "create") result = economy.organizations.createOrganization(store, ident.userId, { id: q.id, name: q.name });
  else if (q.action === "grant") result = economy.organizations.grantToOrganization(store, q.orgId, amounts(q), { by: ident.userId });
  else if (q.action === "allocate") result = economy.organizations.allocateToUser(store, q.orgId, q.userId || ident.userId, amounts(q), { by: ident.userId });
  else result = economy.organizations.listOrganizations(store, ident.userId);
  writeStore(store);
  return json($i, { BH: "B\"H", ok: true, result, summary: economy.organizations.summary(store) });
}
function amounts(q) { return { routing: Number(q.routing || q.amount || 0), compute: Number(q.compute || 0), storage: Number(q.storage || 0), gpu: Number(q.gpu || 0) }; }
module.exports = { organization };
