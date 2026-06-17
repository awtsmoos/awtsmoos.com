// B"H
const { jsonBlock, shell } = require("./components/Shell.js");
const { actionForms } = require("./components/Forms.js");
const { graphPanel } = require("./components/GraphPanel.js");
const { portalGrid } = require("./components/PortalGrid.js");
const { insightPanel, statsGrid } = require("./components/Stats.js");

/**
 * B"H
 * Chapter 813: The Treasury cockpit became a living operating surface.
 * Links are now launch pads, topology is now visible, and the HomePage is only
 * the conductor while each component sings its smaller, clearer spark.
 */
function treasuryHomePage(data = {}) {
  const body = [hero(), portalGrid(), statsGrid(data), graphPanel(data.graph), insightPanel(data), actionForms(), jsonBlock(data)].join("");
  return shell("Awtsmoos Treasury Product", body, data);
}
function hero() {
  return `<section class="awt-hero"><span class="awt-pill">Living Treasury OS</span><h1>Awtsmoos Economy</h1><p>Budgets fence the flow. Forecasts reveal tomorrow. Marketplace fees, agent profit, provider margins, and reputation turn the treasury into a product.</p></section>`;
}
module.exports = { treasuryHomePage };
