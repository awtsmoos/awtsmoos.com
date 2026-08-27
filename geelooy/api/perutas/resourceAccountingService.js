// B"H
const { ORDER, zeroWorldTotals } = require("./resourceWorldService.js");
const guard = require("./budgets/budgetGuardService.js");

/**
 * B"H
 * Chapter 809: Measurement became enforceable.
 * CPU, RAM, storage, bandwidth, and GPU charges may now be recorded only after
 * the treasury confirms the user still has room inside the budget fence.
 */
function measure(input = {}) {
  const measured = {
    cpuMs: Number(input.cpuMs || input.ms || 0),
    ramMbMs: Number(input.ramMbMs || 0),
    storageBytes: Number(input.storageBytes || input.bytes || 0),
    bandwidthBytes: Number(input.bandwidthBytes || input.bytes || 0),
    gpuSeconds: Number(input.gpuSeconds || 0)
  };
  return { measured, charges: chargesFor(measured) };
}
function record(store, userId, input = {}) {
  store.perutaResourceAccounting = store.perutaResourceAccounting || [];
  const measured = measure(input);
  if (input.enforceBudget !== false) {
    const gate = guard.commitSpend(store, "user", userId, measured.charges, { userId, action: "resource_accounting", source: input.source || "local" });
    if (!gate.ok) return { ok: false, blocked: true, error: gate.error, guard: gate, ...measured, source: input.source || "local", at: new Date().toISOString() };
  }
  const entry = { ok: true, userId, ...measured, source: input.source || "local", at: new Date().toISOString() };
  store.perutaResourceAccounting.push(entry);
  return entry;
}
function summary(store, userId = null) {
  const rows = (store.perutaResourceAccounting || []).filter(x => !userId || x.userId === userId);
  const totals = zeroWorldTotals();
  for (const row of rows) for (const key of ORDER) totals[key] += Number(row.charges?.[key] || 0);
  return { ok: true, count: rows.length, totals, recent: rows.slice(-20).reverse() };
}
function chargesFor(m) {
  return { routing: m.bandwidthBytes / 1000, compute: m.cpuMs / 100, storage: m.storageBytes / 1024, gpu: m.gpuSeconds * 100 };
}
module.exports = { measure, record, summary };
