// B"H
const crypto = require("crypto");
const { accountFor, addCredits } = require("./accountService.js");
const { TIERS, tierFor } = require("./tierService.js");
const { createReceipt, receiptFor, receiptHistory } = require("./receiptService.js");
const subs = require("./subscriptionService.js");

const PACKS = Object.freeze({
  spark: pack("spark", "Spark", 1, 250000, 500, 32, 0),
  handful: pack("handful", "Handful", 5, 2000000, 5000, 256, 4),
  river: pack("river", "River", 15, 9000000, 25000, 2048, 20),
  sea: pack("sea", "Sea", 50, 50000000, 150000, 8192, 100)
});

/** B"H: Purchase gates resolve offers, simulate captures, and keep receipts. */
function pack(code, name, priceUsd, routing, compute, storage, gpu) {
  return { code, name, priceUsd, kind: "pack", amounts: { routing, compute, storage, gpu } };
}
function listOffers() { return { packs: PACKS, subscriptions: Object.values(TIERS).filter(x => x.monthlySubscription) }; }
function offerFor(query = {}) {
  const type = String(query.type || query.kind || "pack").toLowerCase();
  if (type === "subscription" || type === "tier") return subscriptionOffer(query.tier || query.plan || "alef");
  return PACKS[String(query.pack || query.offer || "handful")] || PACKS.handful;
}
function subscriptionOffer(code) {
  const tier = tierFor(code);
  return { code: tier.code, name: tier.name, priceUsd: tier.priceUsd, kind: "subscription", amounts: tier.daily, tier: tier.code, monthly: true };
}
function preview(query = {}) {
  const offer = offerFor(query);
  return { ok: true, sandbox: true, mode: "preview", order: orderFor(offer), offer, receipt: null };
}
function simulate(store, userId, query = {}) {
  const offer = offerFor(query);
  const before = clone(accountFor(store, userId).balances);
  const provisional = orderFor(offer);
  const account = addCredits(store, userId, offer.amounts, {
    kind: "sandbox_purchase", simulated: true, receiptId: provisional.id, offerCode: offer.code, tier: offer.tier || null
  });
  const receipt = createReceipt(store, userId, offer, before, account.balances, { receiptId: provisional.id });
  const subscription = offer.kind === "subscription" ? subs.activateSubscription(store, userId, offer, { receiptId: receipt.id }) : null;
  return { ok: true, sandbox: true, mode: "captured", receipt, offer, account, subscription };
}
function history(store, userId, limit = 50) {
  return { receipts: receiptHistory(store, userId, limit), subscription: subs.subscriptionFor(store, userId), subscriptionEvents: subs.subscriptionHistory(store, userId, limit) };
}
function receipt(store, userId, id) { return receiptFor(store, userId, id); }
function lifecycle(store, userId, action = "status") {
  if (action === "cancel") return subs.cancelSubscription(store, userId, { source: "sandbox" });
  if (action === "renew") return subs.renewSubscription(store, userId, { source: "sandbox" });
  return subs.subscriptionFor(store, userId);
}
function orderFor(offer) {
  return { id: `sim_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`, status: "SIMULATED", priceUsd: offer.priceUsd, createdAt: new Date().toISOString() };
}
function clone(b = {}) { return { routing: Number(b.routing || 0), compute: Number(b.compute || 0), storage: Number(b.storage || 0), gpu: Number(b.gpu || 0) }; }
module.exports = { PACKS, history, lifecycle, listOffers, offerFor, preview, receipt, simulate };
