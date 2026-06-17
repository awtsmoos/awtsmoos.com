// B"H
const { accountFor, grantDaily, summary } = require("./accountService.js");
const { estimate, payloadEstimate, round } = require("./economyMath.js");
const { pushLedger, usageEvent, usageFor } = require("./ledgerService.js");
const { PURCHASE_URL, tierFor } = require("./tierService.js");

/** B"H: Observe-only economy until the whole treasury UI and DB are done. */
function canAfford(store, userId, payload = {}, meta = {}) {
  const { account, tier } = grantDaily(store, userId, Date.now(), meta);
  const estimated = payloadEstimate(payload);
  return { ok: true, enforcement: "observe_only", balance: account.balances[estimated.category], plan: tier.code, tier, ...estimated, shortfall: 0, purchaseUrl: PURCHASE_URL, messageForAi: null };
}
function charge(store, entry = {}) {
  const userId = entry.userId || "anonymous";
  const account = accountFor(store, userId, entry);
  const tier = tierFor(account.tier, userId);
  const category = entry.category || payloadEstimate(entry).category;
  const measured = estimate({ ...entry, category });
  const perutas = tier.master ? 0 : measured;
  if (!tier.master) account.balances[category] = round(Number(account.balances[category] || 0) - perutas);
  account.lifetimeSpent = round(Number(account.lifetimeSpent || 0) + perutas);
  const event = eventFor(entry, userId, category);
  usageEvent(store, event);
  pushLedger(store, { userId, kind: "usage_charge", category, perutas: -perutas, measuredPerutas: measured, balances: account.balances, event });
  return { chargedPerutas: perutas, category, balance: account.balances[category], balances: account.balances, plan: tier.code, tier, purchaseUrl: PURCHASE_URL };
}
function eventFor(entry, userId, category) {
  return { userId, action: entry.action || "unknown", path: entry.path || null, bytes: Number(entry.bytes || 0), seconds: Number(entry.seconds || 0), category, routeType: entry.vessel || entry.tunnelName || "unknown", ok: entry.ok !== false };
}
function usageSummary(store, userId) {
  grantDaily(store, userId || "anonymous");
  const got = summary(store, userId || "anonymous");
  const usage = usageFor(store, userId || "anonymous", 100);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const today = usage.filter(x => x.at >= todayStart.getTime());
  return { perutaBalance: got.account.balances.routing, balances: got.account.balances, plan: got.account.tier, tier: got.tier, plans: got.plans, purchaseUrl: got.purchaseUrl, todayRequests: today.length, totalRequests: usage.length, todayBytes: today.reduce((a, b) => a + Number(b.bytes || 0), 0), lastLedger: got.ledger, last: usage };
}
module.exports = { canAfford, charge, usageSummary };
