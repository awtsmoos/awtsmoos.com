// B"H
const assert = require("assert");
const economy = require("../../../../perutas/index.js");
const { addCredits } = require("../../../../perutas/accountService.js");

/** B"H: The real spend paths must pass through budget gates and money splits. */
function run() {
  const store = { perutaLedger: [], usageEvents: [] };
  const userId = "guard_user";
  addCredits(store, userId, { routing: 1000000, compute: 100000, storage: 1000, gpu: 100 }, { kind: "seed" });
  economy.budgets.createBudget(store, userId, { id: "user_guard", limits: { routing: 300000, compute: 2000, storage: 100, gpu: 20 } });

  const blockedProvider = economy.provider.run(store, userId, "capture", { type: "pack", pack: "river", provider: "sandbox" });
  assert.strictEqual(blockedProvider.ok, false);
  assert.strictEqual(blockedProvider.error, "budget_exceeded");

  const okProvider = economy.provider.run(store, userId, "capture", { type: "pack", pack: "spark", provider: "sandbox", providerCostPerutas: 100 });
  assert.strictEqual(okProvider.ok, true);
  assert(okProvider.margin.marginPerutas > 0);

  const agent = economy.agents.registerAgent(store, userId, { id: "guard_agent" });
  economy.agents.fundAgent(store, agent.id, { routing: 1000, compute: 1000, storage: 100, gpu: 10 });
  economy.budgets.createBudget(store, userId, { id: "agent_guard", entityType: "agent", entityId: agent.id, limits: { routing: 10, compute: 10, storage: 10, gpu: 10 } });
  const blockedAgent = economy.agents.spend(store, agent.id, { routing: 20, compute: 0, storage: 0, gpu: 0 }, { userId });
  assert.strictEqual(blockedAgent.ok, false);

  const service = economy.marketplace.listService(store, userId, { id: "guard_service", price: { routing: 50, compute: 10, storage: 0, gpu: 0 }, commissionRate: 0.2 });
  const order = economy.marketplace.purchase(store, userId, service.id);
  assert.strictEqual(order.status, "SIMULATED_SETTLED");
  assert(order.settlement.commission.routing > 0);
  assert.strictEqual(economy.commissions.summary(store).count, 1);

  const blockedResource = economy.resources.record(store, userId, { cpuMs: 20000, bytes: 999999, gpuSeconds: 20, source: "test" });
  assert.strictEqual(blockedResource.ok, false);

  const kinds = store.perutaLedger.map(x => x.kind);
  assert(kinds.includes("budget_blocked_attempt"));
  assert(kinds.includes("marketplace_commission_taken"));
  assert(kinds.includes("provider_margin_recorded"));
  return { ok: true, ledger: store.perutaLedger.length, commissions: economy.commissions.summary(store).count };
}
module.exports = { run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
