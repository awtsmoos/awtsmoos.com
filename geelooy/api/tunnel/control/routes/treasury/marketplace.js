// B"H
const { amounts, treasuryRoute } = require("./routeTools.js");
const { jsonBlock, kpi, shell } = require("../../views/treasury/components/Shell.js");
async function treasuryMarketplace($i) {
  return treasuryRoute($i, async ({ q, store, ident, economy }) => {
    if (q.action === "commission") economy.commissions.recordSettlement(store, { buyerId: ident.userId, sellerId: q.sellerId || ident.userId, agentId: q.agentId || null, serviceId: q.serviceId || null, price: amounts(q) });
    const commissions = economy.commissions.summary(store);
    const marketplace = economy.marketplace.summary(store);
    const html = shell("Treasury Marketplace", `<section class="awt-hero"><h1>Marketplace Money</h1><p>Commission, seller income, agent income, and platform spread.</p></section><section class="awt-grid">${kpi("Services", marketplace.services.length, "listed")}${kpi("Orders", marketplace.orders.length, "settled")}${kpi("Commissions", commissions.count, "records")}</section>${jsonBlock({ marketplace, commissions })}`, { marketplace, commissions });
    return { marketplace, commissions, html };
  });
}
module.exports = { treasuryMarketplace };
