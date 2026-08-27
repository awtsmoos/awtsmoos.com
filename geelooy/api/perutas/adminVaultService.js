// B"H
const { zeroWorldTotals } = require("./resourceWorldService.js");

/**
 * B"H
 * Chapter 704: The admin no longer saw fragments, but a vault of relations.
 * Accounts, receipts, organizations, agents, marketplace orders, and ledger
 * movements gather into one local control-center summary.
 */
function vaultOverview(store) {
  const accounts = Object.values(store.perutaAccounts || {});
  const receipts = store.perutaReceipts || [];
  const organizations = Object.values(store.perutaOrganizations || {});
  const agents = Object.values(store.perutaAgents || {});
  const market = store.perutaMarketplace || { services: {}, orders: {} };
  const ledger = store.perutaLedger || [];
  return {
    counts: {
      accounts: accounts.length,
      receipts: receipts.length,
      organizations: organizations.length,
      agents: agents.length,
      services: Object.keys(market.services || {}).length,
      orders: Object.keys(market.orders || {}).length,
      ledger: ledger.length
    },
    totals: {
      accountBalances: totalBalances(accounts),
      organizationBalances: totalBalances(organizations),
      agentBalances: totalBalances(agents)
    },
    recent: {
      receipts: receipts.slice(-10).reverse(),
      ledger: ledger.slice(-30).reverse(),
      orders: Object.values(market.orders || {}).slice(-10).reverse()
    }
  };
}
function totalBalances(items) {
  const total = zeroWorldTotals();
  for (const item of items) {
    const b = item.balances || {};
    for (const key of Object.keys(total)) total[key] += Number(b[key] || 0);
  }
  return total;
}
module.exports = { vaultOverview };
