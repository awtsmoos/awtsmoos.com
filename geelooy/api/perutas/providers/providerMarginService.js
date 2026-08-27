// B"H
const { pushLedger } = require("../ledgerService.js");

/** B"H: Provider margin measures the spread between user charge and provider cost. */
function recordMargin(store, userId, input = {}) {
  store.perutaProviderMargins = store.perutaProviderMargins || [];
  const charged = Number(input.chargedPerutas || input.charged || 0);
  const cost = Number(input.providerCostPerutas || input.cost || 0);
  const margin = Math.round((charged - cost) * 1000) / 1000;
  const row = { id: input.id || `pm_${Date.now().toString(36)}`, userId, provider: input.provider || "sandbox", model: input.model || null, chargedPerutas: charged, providerCostPerutas: cost, marginPerutas: margin, marginPercent: charged ? Math.round((margin / charged) * 1000) / 10 : 0, at: new Date().toISOString() };
  store.perutaProviderMargins.push(row);
  pushLedger(store, { userId, kind: "provider_margin_recorded", provider: row.provider, amounts: { routing: margin, compute: 0, storage: 0, gpu: 0 }, meta: row });
  return row;
}
function summary(store) {
  const rows = store.perutaProviderMargins || [];
  const total = rows.reduce((a, x) => a + Number(x.marginPerutas || 0), 0);
  return { ok: true, count: rows.length, totalMargin: Math.round(total * 1000) / 1000, recent: rows.slice(-20).reverse() };
}
module.exports = { recordMargin, summary };
