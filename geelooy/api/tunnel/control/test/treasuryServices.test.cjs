// B"H
const assert = require("assert");
const economy = require("../../../perutas/index.js");
const { migrateStore } = require("../core/storeMigrations.js");
const { audit, auditRecent } = require("../core/auditLog.js");

/** B"H: The treasury services must remember every vessel separately. */
function run() {
  const store = migrateStore({ perutaLedger: [], usageEvents: [] });
  const userId = "treasury_service_user";
  const purchase = economy.purchase.simulate(store, userId, { type: "pack", pack: "river" });
  const provider = economy.provider.run(store, userId, "capture", { provider: "sandbox", pack: "spark" });
  const refund = economy.refunds.issueRefund(store, userId, { receiptId: purchase.receipt.id, amounts: { routing: 2, compute: 1, storage: 0, gpu: 0 } });
  const resource = economy.resources.record(store, userId, { cpuMs: 300, bytes: 4096, gpuSeconds: 2 });
  const fraud = economy.fraud.analyze(store, userId);
  audit(store, { userId, kind: "services_test" });
  assert.strictEqual(purchase.ok, true);
  assert.strictEqual(purchase.receipt.lineItems.length, 4);
  assert.strictEqual(provider.result.status, "captured");
  assert.strictEqual(refund.refund.status, "SIMULATED_REFUNDED");
  assert(resource.charges.compute > 0);
  assert.strictEqual(fraud.ok, true);
  assert.strictEqual(auditRecent(store, 1)[0].kind, "services_test");
  return { ok: true, ledger: store.perutaLedger.length, refunds: store.perutaRefunds.length };
}
module.exports = { run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
