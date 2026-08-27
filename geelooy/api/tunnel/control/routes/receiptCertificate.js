// B"H
const { html, json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { readStore } = require("../core/store.js");
const economy = require("../../../perutas/index.js");

/** B"H: Receipt certificate route, returning either scroll HTML or JSON. */
async function receiptCertificate($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const q = $i?.paramKinds?.GET || {};
  const certificate = economy.receipts.certificateFor(readStore(), ident.userId, q.id);
  if (!certificate) return json($i, { BH: "B\"H", ok: false, error: "receipt_not_found" }, 404);
  if (q.format === "json" || q.json === "1") return json($i, { BH: "B\"H", ok: true, certificate });
  return html($i, certificate.html);
}
module.exports = { receiptCertificate };
