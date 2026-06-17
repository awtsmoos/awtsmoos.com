// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore } = require("../core/store.js");
const economy = require("../../../perutas/index.js");

/** B"H: JSON flow map route. The river is drawn from ledger evidence. */
async function flow($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const store = readStore();
  return json($i, { BH: "B\"H", ok: true, flow: economy.flow.flowSummary(store, ident.userId), worlds: economy.worlds.allWorlds() });
}
module.exports = { flow };
