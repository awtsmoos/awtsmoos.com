// B"H
const { MASTER_BALANCE, PURCHASE_URL, isMasterUser, publicTiers, tierFor } = require("./tierService.js");
const { ledgerFor, pushLedger } = require("./ledgerService.js");
const { round } = require("./economyMath.js");
const { ensureIdentity } = require("./identityService.js");

/** B"H: Server-side account vessels, split by resource category. */
function accountFor(store, userId, meta = {}) {
  store.perutaAccounts = store.perutaAccounts || {};
  const id = userId || "anonymous";
  const account = store.perutaAccounts[id] || fresh(id);
  const tier = tierFor(account.tier || account.plan, id);
  account.userId = id;
  account.tier = tier.code;
  account.plan = tier.code;
  account.clusterId = ensureIdentity(store, id, meta).clusterId;
  if (tier.master || isMasterUser(id)) makeMaster(account);
  store.perutaAccounts[id] = account;
  return account;
}
function fresh(userId) { return { userId, tier: "free", plan: "free", balances: zero(), lifetimePurchased: 0, lifetimeSpent: 0, lastDailyGrant: "", createdAt: Date.now(), updatedAt: Date.now() }; }
function zero() { return { routing: 0, compute: 0, storage: 0, gpu: 0 }; }
function makeMaster(account) { account.tier = "master"; account.plan = "master"; account.balances = { routing: MASTER_BALANCE, compute: MASTER_BALANCE, storage: MASTER_BALANCE, gpu: MASTER_BALANCE }; }
function grantDaily(store, userId, at = Date.now(), meta = {}) {
  const account = accountFor(store, userId, meta);
  const tier = tierFor(account.tier, userId);
  if (tier.master) return { granted: zero(), account, tier };
  const today = new Date(at).toISOString().slice(0, 10);
  if (account.lastDailyGrant === today) return { granted: zero(), account, tier };
  const granted = zero();
  for (const key of Object.keys(granted)) grantOne(account, tier, key, granted);
  account.lastDailyGrant = today;
  account.updatedAt = Date.now();
  pushLedger(store, { userId, kind: "daily_refresh", tier: tier.code, amounts: granted, balances: account.balances });
  return { granted, account, tier };
}
function grantOne(account, tier, key, granted) {
  const room = Math.max(0, Number(tier.caps[key] || 0) - Number(account.balances[key] || 0));
  granted[key] = Math.min(Number(tier.daily[key] || 0), room);
  account.balances[key] = round(Number(account.balances[key] || 0) + granted[key]);
}
function addCredits(store, userId, amounts, meta = {}) {
  const account = accountFor(store, userId, meta);
  const tier = tierFor(meta.tier || account.tier, userId);
  account.tier = tier.code; account.plan = tier.code;
  const got = normalizeAmounts(amounts);
  for (const [key, value] of Object.entries(got)) account.balances[key] = round(Number(account.balances[key] || 0) + value);
  account.lifetimePurchased = round(Number(account.lifetimePurchased || 0) + sum(got));
  pushLedger(store, { userId, kind: meta.kind || "admin_credit", amounts: got, balances: account.balances, meta });
  return account;
}
function normalizeAmounts(value) { if (typeof value === "number") return { routing: value, compute: value, storage: 0, gpu: 0 }; return { routing: Number(value.routing || 0), compute: Number(value.compute || 0), storage: Number(value.storage || 0), gpu: Number(value.gpu || 0) }; }
function sum(obj) { return Object.values(obj).reduce((a, b) => a + Number(b || 0), 0); }
function summary(store, userId) { const account = accountFor(store, userId); return { account, tier: tierFor(account.tier, userId), plans: publicTiers(), purchaseUrl: PURCHASE_URL, ledger: ledgerFor(store, userId, 50) }; }
module.exports = { accountFor, addCredits, grantDaily, normalizeAmounts, summary };
