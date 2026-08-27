// B"H
const { treasuryRoute } = require("./routeTools.js");
const { jsonBlock, kpi, shell } = require("../../views/treasury/components/Shell.js");

/** B"H: Forecast route reveals burn, depletion, spikes, and recommendations. */
async function treasuryForecast($i) {
  return treasuryRoute($i, async ({ store, ident, economy }) => {
    const forecast = economy.forecasting.forecast(store, ident.userId);
    return { forecast, html: shell("Treasury Forecast", `<section class="awt-hero"><h1>Forecast</h1><p>${forecast.recommendation.message}</p></section><section class="awt-grid">${kpi("Daily burn", sum(forecast.dailyBurn), "perutas/day")}${kpi("Spikes", forecast.spikes.length, "detected")}${kpi("Recommended plan", forecast.recommendation.plan, "next covenant")}</section>${jsonBlock(forecast)}`, { forecast }) };
  });
}
function sum(x = {}) { return Object.values(x).reduce((a, b) => a + Number(b || 0), 0).toLocaleString(); }
module.exports = { treasuryForecast };
