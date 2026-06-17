// B"H
const assert = require("assert");
const { snapshot } = require("../../routes/treasury/home.js");
const { treasuryHomePage } = require("../../views/treasury/TreasuryHomePage.js");
const { addCredits } = require("../../../../perutas/accountService.js");
const economy = require("../../../../perutas/index.js");

/** B"H: The sellable treasury UI must render controls, launch pads, and graph topology. */
function run() {
  const store = { perutaLedger: [], usageEvents: [] };
  const userId = "ui_product_user";
  addCredits(store, userId, { routing: 1000, compute: 100, storage: 10, gpu: 1 }, { kind: "seed" });
  economy.budgets.createBudget(store, userId, { limits: { routing: 500, compute: 50, storage: 5, gpu: 1 } });
  const html = treasuryHomePage(snapshot(store, userId, economy));
  assert(html.includes("Awtsmoos Economy"));
  assert(html.includes("Launch Surfaces"));
  assert(html.includes("Interactive Treasury Graph"));
  assert(html.includes("awt-portal-grid"));
  assert(html.includes("awt-graph"));
  assert(html.includes("Treasury graph"));
  assert(html.includes("/apps/code/"));
  assert(html.includes("/os"));
  assert(html.includes("Provider margin"));
  assert(html.includes("Create Budget"));
  assert(html.includes("Record Commission"));
  assert(html.includes("Record Provider Margin"));
  assert(html.includes("Add Reputation"));
  return { ok: true, htmlBytes: Buffer.byteLength(html) };
}
module.exports = { run };
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
