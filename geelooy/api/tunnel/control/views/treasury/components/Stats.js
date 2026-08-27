// B"H
const { esc, kpi } = require("./Shell.js");

function statsGrid(data = {}) {
  return `<section class="awt-grid">${cards(data).join("")}</section>`;
}
function cards(data) {
  return [
    kpi("Balance", total(data.forecast?.balance), data.forecast?.recommendation?.message || "Forecasting active"),
    kpi("Budgets", data.budgets?.budgets?.length || 0, "active vessels"),
    kpi("Commission", total(data.commissions?.totals?.commission), "platform revenue"),
    kpi("Provider margin", data.providerMargins?.totalMargin || 0, "spread captured"),
    kpi("Agents", data.agentProfit?.agents?.length || 0, "profit tracked"),
    kpi("Reputation", data.reputation?.rows?.length || 0, "trust signals")
  ];
}
function insightPanel(data = {}) {
  return `<section class="awt-grid"><div class="awt-card"><h2>Resource Forecast</h2>${rivers(data.forecast?.dailyBurn)}</div><div class="awt-card"><h2>Advisor</h2>${insights(data.advisor?.insights)}</div></section>`;
}
function insights(items = []) {
  const rows = (items || []).map(x => `<div class="awt-row"><span>${esc(x.kind)}</span><b>${esc(x.title)}</b></div>`).join("");
  return rows || `<p>No insights yet.</p>`;
}
function rivers(amounts = {}) {
  const keys = ["routing", "compute", "storage", "gpu"];
  const max = Math.max(1, ...keys.map(k => Number(amounts?.[k] || 0)));
  return keys.map(k => river(k, Number(amounts?.[k] || 0), max)).join("");
}
function river(key, amount, max) {
  const width = Math.min(100, (amount / max) * 100);
  return `<p>${esc(key)} ${esc(amount.toLocaleString())}</p><div class="awt-river"><span style="width:${width}%"></span></div>`;
}
function total(obj = {}) {
  return Object.values(obj || {}).reduce((a, b) => a + Number(b || 0), 0).toLocaleString();
}
module.exports = { insightPanel, statsGrid, total };
