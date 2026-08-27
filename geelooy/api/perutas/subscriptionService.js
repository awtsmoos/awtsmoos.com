// B"H
const { tierFor } = require("./tierService.js");
const { pushLedger } = require("./ledgerService.js");

/**
 * B"H
 * Chapter 497: The subscription is a moon that returns by covenant.
 * The stored moon may wax and wane, but returned snapshots do not mutate the
 * past. Each lifecycle call returns a fresh copy for honest receipts.
 */
function activateSubscription(store, userId, offer, meta = {}) {
  store.perutaSubscriptions = store.perutaSubscriptions || {};
  const tier = tierFor(offer.tier || offer.code, userId);
  const now = meta.at || Date.now();
  const sub = {
    id: meta.subscriptionId || `sub_${userId}_${tier.code}`,
    userId,
    tier: tier.code,
    status: "active",
    provider: meta.provider || "sandbox",
    providerRef: meta.providerRef || null,
    startedAt: new Date(now).toISOString(),
    currentPeriodStart: new Date(now).toISOString(),
    currentPeriodEnd: new Date(now + days(30)).toISOString(),
    renewedAt: null,
    canceledAt: null,
    expiredAt: null,
    receiptId: meta.receiptId || null
  };
  store.perutaSubscriptions[userId] = sub;
  pushLedger(store, { userId, kind: "subscription_activated", tier: tier.code, meta: { receiptId: sub.receiptId } });
  return clone(sub);
}
function renewSubscription(store, userId, meta = {}) {
  const sub = storedSubscription(store, userId);
  if (!sub) return null;
  const now = meta.at || Date.now();
  sub.status = "active";
  sub.renewedAt = new Date(now).toISOString();
  sub.currentPeriodStart = sub.renewedAt;
  sub.currentPeriodEnd = new Date(now + days(30)).toISOString();
  pushLedger(store, { userId, kind: "subscription_renewed", tier: sub.tier, meta });
  return clone(sub);
}
function cancelSubscription(store, userId, meta = {}) {
  const sub = storedSubscription(store, userId);
  if (!sub) return null;
  sub.status = "canceled";
  sub.canceledAt = new Date(meta.at || Date.now()).toISOString();
  pushLedger(store, { userId, kind: "subscription_canceled", tier: sub.tier, meta });
  return clone(sub);
}
function subscriptionFor(store, userId) { return clone(storedSubscription(store, userId)); }
function storedSubscription(store, userId) { return (store.perutaSubscriptions || {})[userId] || null; }
function subscriptionHistory(store, userId, limit = 50) {
  return (store.perutaLedger || []).filter(x => x.userId === userId && String(x.kind || "").startsWith("subscription_")).slice(-limit).reverse();
}
function clone(value) { return value ? JSON.parse(JSON.stringify(value)) : null; }
function days(n) { return Number(n || 0) * 24 * 60 * 60 * 1000; }
module.exports = { activateSubscription, cancelSubscription, renewSubscription, subscriptionFor, subscriptionHistory };
