// B"H
const { amounts, treasuryRoute } = require("./routeTools.js");
const { jsonBlock, kpi, shell } = require("../../views/treasury/components/Shell.js");

/** B"H: Budget route creates and records budget spend. */
async function treasuryBudgets($i) {
  return treasuryRoute($i, async ({ q, store, ident, economy }) => {
    if (q.action === "create") economy.budgets.createBudget(store, ident.userId, { ...q, limits: amounts(q), entityType: q.entityType || "user", entityId: q.entityId || ident.userId });
    if (q.action === "spend") economy.budgets.recordSpend(store, q.entityType || "user", q.entityId || ident.userId, amounts(q), { route: "treasury/budgets" });
    const budgets = economy.budgets.summary(store, q.entityType || null, q.entityId || null);
    return { budgets, html: shell("Treasury Budgets", `<section class="awt-hero"><h1>Budgets</h1><p>Set hard limits for users, agents, orgs, workflows, and tunnels.</p></section><section class="awt-grid">${kpi("Budgets", budgets.budgets.length, "active records")}${kpi("Warnings", budgets.budgets.filter(b => b.warning).length, "80%+")}${kpi("Blocked", budgets.budgets.filter(b => b.overLimit).length, "100%+")}</section>${jsonBlock(budgets)}`, { budgets }) };
  });
}
module.exports = { treasuryBudgets };
