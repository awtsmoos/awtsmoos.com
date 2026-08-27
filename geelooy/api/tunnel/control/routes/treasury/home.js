// B"H
const { treasuryRoute } = require("./routeTools.js");
const { treasuryHomePage } = require("../../views/treasury/TreasuryHomePage.js");

/** B"H: Product cockpit home. */
async function treasuryHome($i) {
  return treasuryRoute($i, async ({ store, ident, economy }) => {
    const userId = ident.userId;
    const data = snapshot(store, userId, economy);
    return { ...data, html: treasuryHomePage(data) };
  });
}
function snapshot(store, userId, economy) {
  return {
    identity: { userId },
    forecast: economy.forecasting.forecast(store, userId),
    budgets: economy.budgets.summary(store, "user", userId),
    commissions: economy.commissions.summary(store),
    agentProfit: economy.agentProfit.allProfits(store),
    providerMargins: economy.providerMargins.summary(store),
    advisor: economy.advisor.advise(store, userId, economy),
    reputation: economy.reputation.leaderboard(store),
    graph: economy.treasuryGraph.graph(store, userId)
  };
}
module.exports = { treasuryHome, snapshot };
