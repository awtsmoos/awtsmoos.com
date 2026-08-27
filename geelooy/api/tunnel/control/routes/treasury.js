// B"H
const { html, json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore } = require("../core/store.js");
const { usageSummary } = require("../core/usageStore.js");
const { listNativeTunnels } = require("./fsVessel/tunnelClient.js");
const { treasuryCockpit } = require("../views/treasuryCockpit.js");
const economy = require("../../../perutas/index.js");

/** B"H: Main living treasury OS cockpit. */
async function treasury($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const GET = $i?.paramKinds?.GET || {};
  const store = readStore();
  const usage = usageSummary(ident.userId);
  const worlds = economy.worlds.decorateBalances(usage.balances);
  const flow = economy.flow.flowSummary(store, ident.userId);
  const devices = economy.devices.deviceGraph(store, ident.userId, listNativeTunnels($i));
  const history = economy.purchase.history(store, ident.userId);
  const data = { BH: "B\"H", ok: true, identity: ident, usage, worlds, flow, devices, history };
  if (GET.format === "json" || GET.json === "1") return json($i, data);
  return html($i, treasuryCockpit({ ident, usage, worlds, flow, devices, history }));
}
module.exports = { treasury };
