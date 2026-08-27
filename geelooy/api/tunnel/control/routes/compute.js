// B"H
const { html, json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { PLANS, PURCHASE_URL, usageSummary } = require("../core/usageStore.js");
const { readStore, writeStore } = require("../core/store.js");
const { computePage } = require("../views/computePage.js");
const economy = require("../../../perutas/index.js");
const { BASE_PRICE, createOrderPayload, fakeApproval } = require("../billing/paypalSandboxPlan.js");
const { COINS, convertCoin, convertPerutas } = require("../billing/talmudicCoins.js");

/** B"H: Compute treasury route with receipts, history, and sandbox lifecycle. */
async function compute($i) {
  const ident = currentIdentity($i);
  const GET = $i?.paramKinds?.GET || {};
  const store = readStore();
  const usage = ident.ok ? usageSummary(ident.userId) : null;
  const history = ident.ok ? economy.purchase.history(store, ident.userId) : null;
  const sandboxOrder = fakeApproval(String(GET.pack || "handful"), "https://awtsmoos.com");
  const purchasePreview = economy.purchase.preview(GET);
  const data = payload({ ident, GET, usage, sandboxOrder, purchasePreview, history });
  if (GET.format === "json" || GET.json === "1") return json($i, data);
  return html($i, computePage({ ident, usage, plans: PLANS, sandboxOrder, purchasePreview, offers: economy.purchase.listOffers(), history }));
}
function payload({ ident, GET, usage, sandboxOrder, purchasePreview, history }) {
  const amount = Number(GET.amount || GET.perutas || 100000);
  const coin = String(GET.coin || "peruta");
  return { BH: "B\"H", ok: true, title: "Awtsmoos Compute", canonicalUrl: PURCHASE_URL, enforcement: "observe_only", basePrice: BASE_PRICE, offers: economy.purchase.listOffers(), sandboxOrder, purchasePreview, history, sandboxCreateOrderPayload: createOrderPayload(String(GET.pack || "handful"), `${PURCHASE_URL}?success=1`, `${PURCHASE_URL}?cancel=1`), selected: { coin, amount, conversion: convertCoin(amount, coin), perutaConversions: convertPerutas(amount) }, coins: COINS, plans: PLANS, current: usage, identity: ident.ok ? ident : null };
}
async function computeCapture($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const GET = $i?.paramKinds?.GET || {};
  const store = readStore();
  const captured = economy.purchase.simulate(store, ident.userId, GET);
  writeStore(store);
  return json($i, { BH: "B\"H", ...captured, usage: usageSummary(ident.userId), history: economy.purchase.history(store, ident.userId), warning: "Sandbox capture credited simulated perutas/subscription without contacting PayPal. Production must verify provider capture first." });
}
async function computeHistory($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const store = readStore();
  return json($i, { BH: "B\"H", ok: true, history: economy.purchase.history(store, ident.userId) });
}
async function computeReceipt($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const receipt = economy.purchase.receipt(readStore(), ident.userId, $i?.paramKinds?.GET?.id);
  return json($i, { BH: "B\"H", ok: !!receipt, receipt, error: receipt ? null : "receipt_not_found" }, receipt ? 200 : 404);
}
async function computeSubscription($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const store = readStore();
  const sub = economy.purchase.lifecycle(store, ident.userId, $i?.paramKinds?.GET?.action || "status");
  writeStore(store);
  return json($i, { BH: "B\"H", ok: true, subscription: sub, history: economy.purchase.history(store, ident.userId) });
}
module.exports = { compute, computeCapture, computeHistory, computeReceipt, computeSubscription };
