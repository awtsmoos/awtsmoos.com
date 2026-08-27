// B"H
const { esc, fmt, recentRows, shell } = require("./economyView.js");

function adminVaultPage({ overview, fraud, audit }) {
  const counts = overview?.counts || {};
  const totals = overview?.totals || {};
  const body = `<section class="hero"><div class="card"><span class="pill">Treasury Control Center</span><h1>Admin Vault</h1><p class="sub">Accounts, receipts, organizations, agents, orders, refunds, audit, and fraud signals.</p></div><div class="card"><h2>Risk score</h2><div class="price">${fmt(fraud?.score || 0)}</div></div></section><section class="grid">${card("Accounts", counts.accounts)}${card("Receipts", counts.receipts)}${card("Organizations", counts.organizations)}${card("Agents", counts.agents)}${card("Services", counts.services)}${card("Orders", counts.orders)}${card("Ledger", counts.ledger)}</section><section class="card"><h2>Account balances</h2><pre>${esc(JSON.stringify(totals.accountBalances || {}, null, 2))}</pre></section><section class="card"><h2>Recent ledger</h2>${recentRows(overview?.recent?.ledger || [])}</section><section class="card"><h2>Audit</h2>${recentRows(audit || [])}</section><section class="card"><h2>Fraud signals</h2><pre>${esc(JSON.stringify(fraud?.signals || [], null, 2))}</pre></section>`;
  return shell("Admin Vault", body, { overview, fraud, audit });
}
function card(label, value) { return `<div class="card"><div class="small">${esc(label)}</div><h2>${fmt(value || 0)}</h2></div>`; }
module.exports = { adminVaultPage };
