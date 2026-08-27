// B"H
const { treasuryRoute } = require("./routeTools.js");
const { graphPanel } = require("../../views/treasury/components/GraphPanel.js");
const { jsonBlock, kpi, shell } = require("../../views/treasury/components/Shell.js");

/**
 * B"H
 * The graph route is not merely raw data; it is the treasury map made visible.
 */
async function treasuryGraph($i) {
  return treasuryRoute($i, async ({ store, ident, economy }) => {
    const graph = economy.treasuryGraph.graph(store, ident.userId);
    const body = `<section class="awt-hero"><h1>Treasury Graph</h1><p>Every user, agent, org, listing, provider, receipt, and ledger is a node in the living map.</p></section><section class="awt-grid">${kpi("Nodes", graph.nodes.length, "entities")}${kpi("Edges", graph.edges.length, "flows")}</section>${graphPanel(graph)}${jsonBlock(graph)}`;
    return { graph, html: shell("Treasury Graph", body, { graph }) };
  });
}
module.exports = { treasuryGraph };
