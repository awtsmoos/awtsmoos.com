// B"H

/** B"H: Treasury advisor turns raw economy numbers into usable counsel. */
function advise(store, userId, economy) {
  const forecast = economy.forecasting.forecast(store, userId);
  const budgets = economy.budgets.summary(store, "user", userId).budgets || [];
  const profit = economy.agentProfit.allProfits(store);
  const provider = economy.providerMargins.summary(store);
  const insights = [];
  if (forecast.spikes.length) insights.push(insight("cost_spike", "A resource spike was detected.", forecast.spikes));
  if (budgets.some(b => b.overLimit)) insights.push(insight("budget_blocked", "A budget is over limit.", budgets.filter(b => b.overLimit)));
  if (profit.agents.some(a => a.profitTotal < 0)) insights.push(insight("agent_loss", "One or more agents are losing perutas.", profit.agents.filter(a => a.profitTotal < 0)));
  if (provider.totalMargin < 0) insights.push(insight("provider_loss", "Provider routing is currently losing margin.", provider));
  if (!insights.length) insights.push(insight("healthy", "Treasury flows look stable.", { recommendation: forecast.recommendation }));
  return { ok: true, userId, insights, forecast, budgets, provider };
}
function insight(kind, title, data) { return { kind, title, data, at: new Date().toISOString() }; }
module.exports = { advise };
