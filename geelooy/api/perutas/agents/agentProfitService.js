// B"H
const { ORDER, zeroWorldTotals } = require("../resourceWorldService.js");

/** B"H: Agent P&L turns each malach into an accountable business. */
function profitFor(store, agentId) {
  const agent = (store.perutaAgents || {})[agentId] || null;
  const revenue = cloneTotals(agent?.earned || zeroWorldTotals());
  const cost = cloneTotals(agent?.spent || zeroWorldTotals());
  const net = zeroWorldTotals();
  for (const key of ORDER) net[key] = Number(revenue[key] || 0) - Number(cost[key] || 0);
  const revenueTotal = sum(revenue);
  const costTotal = sum(cost);
  return { ok: true, agentId, agent, revenue, cost, net, revenueTotal, costTotal, profitTotal: revenueTotal - costTotal, margin: revenueTotal ? Math.round(((revenueTotal - costTotal) / revenueTotal) * 1000) / 10 : 0 };
}
function allProfits(store) {
  return { ok: true, agents: Object.keys(store.perutaAgents || {}).map(id => profitFor(store, id)).sort((a, b) => b.profitTotal - a.profitTotal) };
}
function cloneTotals(x = {}) { const out = {}; for (const key of ORDER) out[key] = Number(x[key] || 0); return out; }
function sum(x = {}) { return ORDER.reduce((a, key) => a + Number(x[key] || 0), 0); }
module.exports = { allProfits, profitFor };
