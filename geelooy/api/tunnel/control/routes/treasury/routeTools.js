// B"H
const { html, json } = require("../../core/respond.js");
const { currentIdentity } = require("../../core/auth.js");
const { readStore, writeStore } = require("../../core/store.js");
const economy = require("../../../../perutas/index.js");

/** B"H: Shared treasury route vessel for JSON and HTML product pages. */
async function treasuryRoute($i, build) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const q = $i?.paramKinds?.GET || {};
  const store = readStore();
  const data = await build({ $i, q, store, ident, economy });
  writeStore(store);
  if (q.format === "json" || q.json === "1") return json($i, { BH: "B\"H", ok: true, ...data });
  return html($i, data.html || "");
}
function amounts(q = {}) { return { routing: Number(q.routing || q.amount || 0), compute: Number(q.compute || 0), storage: Number(q.storage || 0), gpu: Number(q.gpu || 0) }; }
module.exports = { amounts, treasuryRoute };
