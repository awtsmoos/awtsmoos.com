// B"H
const { html, json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore } = require("../core/store.js");
const { auditRecent } = require("../core/auditLog.js");
const { adminVaultPage } = require("../views/adminVaultPage.js");
const economy = require("../../../perutas/index.js");

/** B"H: Admin vault route for the treasury control center. */
async function adminVault($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  if (!isMaster(ident.userId)) return json($i, { BH: "B\"H", ok: false, error: "not_master" }, 403);
  const store = readStore();
  const overview = economy.vault.vaultOverview(store);
  const fraud = economy.fraud.analyze(store);
  const audit = auditRecent(store, 80);
  const data = { BH: "B\"H", ok: true, overview, fraud, audit };
  const q = $i?.paramKinds?.GET || {};
  if (q.format === "json" || q.json === "1") return json($i, data);
  return html($i, adminVaultPage(data));
}
function isMaster(userId) { return userId === "add" || (economy.isMasterUser && economy.isMasterUser(userId)); }
module.exports = { adminVault };
