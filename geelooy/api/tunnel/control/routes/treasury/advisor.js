// B"H
const { treasuryRoute } = require("./routeTools.js");
const { jsonBlock, kpi, shell } = require("../../views/treasury/components/Shell.js");
async function treasuryAdvisor($i) {
  return treasuryRoute($i, async ({ store, ident, economy }) => {
    const advisor = economy.advisor.advise(store, ident.userId, economy);
    const html = shell("Treasury Advisor", `<section class="awt-hero"><h1>AI Treasury Advisor</h1><p>Explain spikes, budget issues, agent losses, and provider margin problems.</p></section><section class="awt-grid">${kpi("Insights", advisor.insights.length, "recommendations")}</section>${jsonBlock(advisor)}`, { advisor });
    return { advisor, html };
  });
}
module.exports = { treasuryAdvisor };
