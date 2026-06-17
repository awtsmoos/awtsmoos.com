// B"H
const assert = require("assert");
const economy = require("../../../../perutas/index.js");
const { accountFor, addCredits } = require("../../../../perutas/accountService.js");

/** B"H: Product services prove budgets, forecasts, margins, graph, trust. */
function run() {
  const store = { perutaLedger: [], usageEvents: [] };
  const userId = "product_user";
  addCredits(store, userId, { routing: 10000, compute: 1000, storage: 100, gpu: 10 }, { kind: "seed" });
  const budget = economy.budgets.createBudget(store, userId, { id: "budget_product", limits: { routing: 100, compute: 50, storage: 5, gpu: 1 } });
  const spend = economy.budgets.recordSpend(store, "user", userId, { routing: 120, compute: 60, storage: 6, gpu: 2 });
  const forecast = economy.forecasting.forecast(store, userId);
  const commission = economy.commissions.recordSettlement(store, { buyerId: userId, sellerId: "seller", price: { routing: 1000, compute: 100, storage: 10, gpu: 1 } });
  const agent = economy.agents.registerAgent(store, userId, { id: "agent_product" });
  economy.agents.fundAgent(store, agent.id, { routing: 100, compute: 100, storage: 0, gpu: 0 });
  economy.agents.spend(store, agent.id, { routing: 10, compute: 20, storage: 0, gpu: 0 });
  economy.agents.income(store, agent.id, { routing: 50, compute: 90, storage: 0, gpu: 0 });
  const profit = economy.agentProfit.profitFor(store, agent.id);
  const margin = economy.providerMargins.recordMargin(store, userId, { charged: 100, cost: 60, provider: "sandbox" });
  economy.reputation.addEvent(store, "agent", agent.id, "positive_review", 7, { userId });
  const reputation = economy.reputation.score(store, "agent", agent.id);
  const graph = economy.treasuryGraph.graph(store, userId);
  const advisor = economy.advisor.advise(store, userId, economy);
  assert.strictEqual(budget.id, "budget_product");
  assert.strictEqual(spend.blocked, true);
  assert.strictEqual(forecast.ok, true);
  assert(commission.commission.routing > 0);
  assert(profit.profitTotal > 0);
  assert.strictEqual(margin.marginPerutas, 40);
  assert.strictEqual(reputation.trustLevel, "rising");
  assert(graph.nodes.length > 0);
  assert(advisor.insights.length > 0);
  assert(accountFor(store, userId).balances.routing > 0);
  return { ok: true, ledger: store.perutaLedger.length, graphNodes: graph.nodes.length };
}
module.exports = { run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
