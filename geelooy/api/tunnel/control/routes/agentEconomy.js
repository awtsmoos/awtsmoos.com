// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore, writeStore } = require("../core/store.js");
const economy = require("../../../perutas/index.js");

/** B"H: Agent economy route for local spend, funding, and income simulation. */
async function agentEconomy($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const q = $i?.paramKinds?.GET || {};
  const store = readStore();
  let result = null;
  if (q.action === "register") result = economy.agents.registerAgent(store, ident.userId, { id: q.id, name: q.name, organizationId: q.orgId });
  else if (q.action === "fund") result = economy.agents.fundAgent(store, q.agentId, amounts(q), { by: ident.userId });
  else if (q.action === "spend") result = economy.agents.spend(store, q.agentId, amounts(q), { userId: ident.userId });
  else if (q.action === "income") result = economy.agents.income(store, q.agentId, amounts(q), { userId: ident.userId });
  else result = economy.agents.listAgents(store, ident.userId);
  writeStore(store);
  return json($i, { BH: "B\"H", ok: true, result, summary: economy.agents.summary(store) });
}
function amounts(q) { return { routing: Number(q.routing || q.amount || 0), compute: Number(q.compute || 0), storage: Number(q.storage || 0), gpu: Number(q.gpu || 0) }; }
module.exports = { agentEconomy };
