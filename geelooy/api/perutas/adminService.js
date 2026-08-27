// B"H
const { addCredits, summary } = require("./accountService.js");
const { publicTiers } = require("./tierService.js");
const vault = require("./adminVaultService.js");

/**
 * B"H
 * Chapter 706: Admin grant remained simple, but the view widened into a vault.
 * The master may inspect accounts, organizations, agents, receipts, marketplace
 * orders, and resource totals without collapsing the four categories.
 */
function adminGrant(store, targetUserId, amounts, meta = {}) {
  const account = addCredits(store, targetUserId, amounts, { ...meta, kind: meta.kind || "admin_grant" });
  return { ok: true, account, summary: summary(store, targetUserId) };
}
function adminOverview(store) {
  return {
    ok: true,
    plans: publicTiers(),
    accounts: Object.values(store.perutaAccounts || {}).map(accountCard),
    clusters: Object.values(store.identityClusters || {}),
    vault: vault.vaultOverview(store)
  };
}
function accountCard(a) {
  return { userId: a.userId, tier: a.tier, balances: a.balances, lifetimePurchased: a.lifetimePurchased || 0, lifetimeSpent: a.lifetimeSpent || 0, clusterId: a.clusterId };
}
module.exports = { adminGrant, adminOverview };
