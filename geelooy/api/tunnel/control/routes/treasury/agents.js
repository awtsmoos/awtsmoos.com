// B"H
const { treasuryRoute } = require("./routeTools.js");
const { jsonBlock, kpi, shell } = require("../../views/treasury/components/Shell.js");
async function treasuryAgents($i) {
  return treasuryRoute($i, async ({ store, economy }) => {
    const agentProfit = economy.agentProfit.allProfits(store);
    const html = shell("Treasury Agents", `<section class="awt-hero"><h1>Agent Profitability</h1><p>Agents are economic actors: revenue, cost, margin, and rankings.</p></section><section class="awt-grid">${kpi("Agents", agentProfit.agents.length, "tracked")}${kpi("Profitable", agentProfit.agents.filter(a => a.profitTotal > 0).length, "positive P&L")}${kpi("Losing", agentProfit.agents.filter(a => a.profitTotal < 0).length, "needs attention")}</section>${jsonBlock(agentProfit)}`, { agentProfit });
    return { agentProfit, html };
  });
}
module.exports = { treasuryAgents };
