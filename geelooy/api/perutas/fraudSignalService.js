// B"H
/** B"H: Suspicion is a signal, not a verdict. */
function analyze(store, userId = null) {
  const ledger = (store.perutaLedger || []).filter(x => !userId || x.userId === userId);
  const refunds = store.perutaRefunds || [];
  const usage = store.usageEvents || [];
  const signals = [];
  if (refunds.length > 5) signals.push(sig("many_refunds", refunds.length));
  if (largeNegative(ledger)) signals.push(sig("large_negative_flow", largeNegative(ledger)));
  if (usage.length > 1000) signals.push(sig("heavy_usage_events", usage.length));
  return { ok: true, userId, signals, score: signals.reduce((a, b) => a + b.weight, 0) };
}
function largeNegative(ledger) {
  return ledger.reduce((a, x) => a + (Number(x.perutas || 0) < -100000 ? 1 : 0), 0);
}
function sig(kind, count) { return { kind, count, weight: Math.min(100, Number(count || 0) * 10), at: new Date().toISOString() }; }
module.exports = { analyze };
