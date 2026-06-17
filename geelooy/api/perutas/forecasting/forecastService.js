// B"H
const { ORDER, zeroWorldTotals } = require("../resourceWorldService.js");
const { accountFor } = require("../accountService.js");

/**
 * B"H
 * Chapter 802: Forecasting is prophecy with humility.
 * It only reads the ledger and usage rivers, then estimates depletion, burn,
 * spikes, and the next plan the vessel may need.
 */
function forecast(store, userId, now = Date.now()) {
  const account = accountFor(store, userId);
  const burn = burnRate(store, userId, now);
  const balance = account.balances || zeroWorldTotals();
  return {
    ok: true,
    userId,
    balance,
    dailyBurn: burn.daily,
    weeklyBurn: multiply(burn.daily, 7),
    monthlyBurn: multiply(burn.daily, 30),
    depletion: depletion(balance, burn.daily, now),
    spikes: spikes(store, userId, now),
    recommendation: recommendation(balance, burn.daily)
  };
}
function burnRate(store, userId, now) {
  const since = now - 7 * 24 * 60 * 60 * 1000;
  const rows = (store.perutaLedger || []).filter(x => x.userId === userId && Number(x.at || 0) >= since);
  const total = zeroWorldTotals();
  for (const row of rows) addNegative(total, row);
  return { daily: divide(total, 7), rows: rows.length };
}
function addNegative(total, row) {
  if (row.amounts) for (const key of ORDER) total[key] += Math.abs(Math.min(0, Number(row.amounts[key] || 0)));
  if (row.category && row.perutas && ORDER.includes(row.category)) total[row.category] += Math.abs(Math.min(0, Number(row.perutas || 0)));
}
function depletion(balance, daily, now) {
  const out = {};
  for (const key of ORDER) {
    const rate = Number(daily[key] || 0);
    const days = rate > 0 ? Math.floor(Number(balance[key] || 0) / rate) : null;
    out[key] = { days, at: days === null ? null : new Date(now + days * 86400000).toISOString() };
  }
  return out;
}
function spikes(store, userId, now) {
  const oneDay = 86400000;
  const recent = ledgerBurn(store, userId, now - oneDay, now);
  const previous = ledgerBurn(store, userId, now - 2 * oneDay, now - oneDay);
  return ORDER.map(key => ({ key, recent: recent[key], previous: previous[key], ratio: previous[key] ? recent[key] / previous[key] : recent[key] ? 999 : 0 })).filter(x => x.ratio >= 2);
}
function ledgerBurn(store, userId, start, end) {
  const total = zeroWorldTotals();
  for (const row of (store.perutaLedger || [])) if (row.userId === userId && Number(row.at || 0) >= start && Number(row.at || 0) < end) addNegative(total, row);
  return total;
}
function recommendation(balance, daily) {
  const totalBalance = sum(balance);
  const dailyTotal = sum(daily);
  if (!dailyTotal) return { plan: "free", message: "No burn detected yet." };
  const days = totalBalance / dailyTotal;
  if (days < 7) return { plan: "studio", message: "Balance depletes within a week. Upgrade or lower burn." };
  if (days < 30) return { plan: "builder", message: "Balance depletes this month. Add a budget and consider a paid plan." };
  return { plan: "free", message: "Burn is currently healthy." };
}
function multiply(x, n) { const out = {}; for (const key of ORDER) out[key] = Number(x[key] || 0) * n; return out; }
function divide(x, n) { const out = {}; for (const key of ORDER) out[key] = Math.round((Number(x[key] || 0) / n) * 100) / 100; return out; }
function sum(x = {}) { return ORDER.reduce((a, key) => a + Number(x[key] || 0), 0); }
module.exports = { forecast };
