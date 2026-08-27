// B"H
const { treasuryRoute } = require("./routeTools.js");
const { jsonBlock, kpi, shell } = require("../../views/treasury/components/Shell.js");
async function treasuryProviders($i) {
  return treasuryRoute($i, async ({ q, store, ident, economy }) => {
    if (q.action === "margin") economy.providerMargins.recordMargin(store, ident.userId, q);
    const providerMargins = economy.providerMargins.summary(store);
    const html = shell("Treasury Providers", `<section class="awt-hero"><h1>Provider Margins</h1><p>Track compute arbitrage: what users pay, what providers cost, and the spread.</p></section><section class="awt-grid">${kpi("Records", providerMargins.count, "margin events")}${kpi("Total margin", providerMargins.totalMargin, "perutas")}</section>${jsonBlock(providerMargins)}`, { providerMargins });
    return { providerMargins, html };
  });
}
module.exports = { treasuryProviders };
