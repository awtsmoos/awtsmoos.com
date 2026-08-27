// B"H
const { treasuryRoute } = require("./routeTools.js");
const { jsonBlock, kpi, shell } = require("../../views/treasury/components/Shell.js");
async function treasuryReputation($i) {
  return treasuryRoute($i, async ({ q, store, ident, economy }) => {
    if (q.action === "add") economy.reputation.addEvent(store, q.subjectType || "agent", q.subjectId || ident.userId, q.kind || "manual", Number(q.weight || 1), { userId: ident.userId });
    const reputation = q.subjectId ? economy.reputation.score(store, q.subjectType || "agent", q.subjectId) : economy.reputation.leaderboard(store, q.subjectType || "agent");
    const html = shell("Treasury Reputation", `<section class="awt-hero"><h1>Reputation Economy</h1><p>Trust becomes visible beside money.</p></section><section class="awt-grid">${kpi("Rows", reputation.rows?.length || reputation.events?.length || 0, "signals")}</section>${jsonBlock(reputation)}`, { reputation });
    return { reputation, html };
  });
}
module.exports = { treasuryReputation };
