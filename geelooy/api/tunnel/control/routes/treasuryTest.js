// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const economy = require("../../../perutas/index.js");

/** B"H: In-memory treasury smoke test for live route confidence. */
async function treasuryTest($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const store = { perutaLedger: [], usageEvents: [] };
  economy.purchase.simulate(store, ident.userId, { type: "pack", pack: "spark" });
  economy.provider.run(store, ident.userId, "preview", { type: "pack", pack: "spark" });
  economy.resources.record(store, ident.userId, { cpuMs: 100, bytes: 2000, gpuSeconds: 1 });
  const fraud = economy.fraud.analyze(store, ident.userId);
  return json($i, { BH: "B\"H", ok: true, ledger: store.perutaLedger.length, receipts: store.perutaReceipts.length, fraud, resources: economy.resources.summary(store, ident.userId) });
}
module.exports = { treasuryTest };
