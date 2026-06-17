// B"H
const { html, json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore, writeStore } = require("../core/store.js");
const economy = require("../../../perutas/index.js");
const { shell, recentRows } = require("../views/economyView.js");

/** B"H: Owner dashboard for grants, tiers, clusters, and usage. */
async function adminPerutas($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  if (!economy.isMasterUser(ident.userId)) return json($i, { BH: "B\"H", ok: false, error: "not_master" }, 403);
  const GET = $i?.paramKinds?.GET || {};
  const store = readStore();
  let grant = null;
  if (GET.target) grant = economy.admin.adminGrant(store, String(GET.target), amounts(GET), { by: ident.userId, tier: GET.tier || undefined });
  const overview = economy.admin.adminOverview(store);
  writeStore(store);
  const data = { BH: "B\"H", ok: true, grant, overview };
  if (GET.format === "json" || GET.json === "1") return json($i, data);
  return html($i, page(data));
}
function amounts(GET) { return { routing: Number(GET.routing || GET.amount || 0), compute: Number(GET.compute || GET.amount || 0), storage: Number(GET.storage || 0), gpu: Number(GET.gpu || 0) }; }
function page({ overview, grant }) {
  const rows = overview.accounts.map(a => ({ action: a.userId, category: a.tier, bytes: a.balances?.routing || 0 }));
  const body = `<section class="hero"><div class="card"><span class="pill">Admin</span><h1>Peruta Control</h1><p class="sub">Grant credits, inspect clusters, and watch the server-side ledger. Example: ?target=user&routing=1000&compute=500&tier=beis</p></div><div class="card"><h2>${overview.accounts.length} accounts</h2><p>${overview.clusters.length} identity clusters</p><p class="small">Last grant: ${grant ? "ok" : "none"}</p></div></section><section class="card"><h2>Accounts</h2><div class="list">${recentRows(rows)}</div></section>`;
  return shell("Peruta Admin", body, overview);
}
module.exports = { adminPerutas };
