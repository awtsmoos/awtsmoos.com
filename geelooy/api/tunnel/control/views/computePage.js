// B"H
const { balanceCards, esc, planCards, recentRows, shell } = require("./economyView.js");

function computePage({ ident, usage, plans, sandboxOrder, offers, history }) {
  const body = `<section class="hero"><div class="card"><span class="pill">Awtsmoos Compute</span><h1>Peruta Treasury</h1><p class="sub">Buy-flow rehearsal now creates receipts, history, and subscription lifecycle state without contacting PayPal.</p><a class="btn" href="/api/tunnel/control/bank">Open bank</a><a class="btn" href="/api/tunnel/control/compute?format=json">JSON</a></div><div class="card"><h2>${esc(ident?.userId || "Guest")}</h2><p class="small">Current tier</p><h2>${esc(usage?.tier?.name || usage?.plan || "Free")}</h2><p class="warn">Sandbox captures are test credits only.</p></div></section><section class="grid">${balanceCards(usage)}</section><h2>Simulate buying more</h2><section class="plans">${packCards(offers?.packs)}</section><h2>Simulate subscriptions</h2><section class="plans">${subscriptionCards(offers?.subscriptions || Object.values(plans || {}))}</section><section class="card"><h2>Recent receipts</h2><div class="list">${receiptRows(history?.receipts)}</div></section><section class="card"><h2>Sandbox order</h2><p class="small">${esc(sandboxOrder?.approvalUrl || sandboxOrder?.captureUrl || "Preview available")}</p></section>`;
  return shell("Awtsmoos Compute", body, { usage, plans, offers, history });
}
function bankPage({ ident, usage, history }) {
  const sub = history?.subscription;
  const body = `<section class="hero"><div class="card"><span class="pill">Peruta Bank</span><h1>Your living ledger</h1><p class="sub">Balances stay split into routing, compute, storage, and GPU. Receipts now show where simulated resources came from.</p><a class="btn" href="/api/tunnel/control/compute">Buy / simulate</a><a class="btn" href="/api/tunnel/control/compute/history?format=json">History JSON</a></div><div class="card"><h2>${esc(ident?.userId || "Guest")}</h2><p class="small">Subscription</p><div class="pill">${esc(sub?.status || "none")}</div><p class="small">${esc(sub?.tier || usage?.tier?.letter || usage?.plan || "free")}</p></div></section><section class="grid">${balanceCards(usage)}</section><section class="card"><h2>Purchase receipts</h2><div class="list">${receiptRows(history?.receipts)}</div></section><section class="card"><h2>Subscription events</h2><div class="list">${recentRows(history?.subscriptionEvents)}</div></section><section class="card"><h2>Recent usage</h2><div class="list">${recentRows(usage?.last)}</div></section><section class="card"><h2>Ledger</h2><div class="list">${recentRows(usage?.lastLedger)}</div></section>`;
  return shell("Awtsmoos Bank", body, { usage, history });
}
function packCards(packs = {}) {
  return Object.values(packs).map(x => `<section class="plan"><span class="pill">PACK</span><h3>${esc(x.name)}</h3><div class="price">$${esc(x.priceUsd)}</div><div class="small">routing ${num(x.amounts.routing)}<br>compute ${num(x.amounts.compute)}<br>storage ${num(x.amounts.storage)}</div><a class="btn" href="/api/tunnel/control/compute/capture?type=pack&pack=${esc(x.code)}&format=json">Simulate buy</a></section>`).join("");
}
function subscriptionCards(items = []) {
  return items.filter(x => x.monthlySubscription).map(x => `<section class="plan"><span class="pill">${esc(x.letter || x.code)}</span><h3>${esc(x.name)}</h3><div class="price">$${esc(x.priceUsd)}/mo</div><div class="small">routing/day ${num(x.daily?.routing)}<br>compute/day ${num(x.daily?.compute)}<br>routing cap ${num(x.caps?.routing)}</div><a class="btn" href="/api/tunnel/control/compute/capture?type=subscription&tier=${esc(x.code)}&format=json">Simulate subscribe</a></section>`).join("");
}
function receiptRows(items = []) {
  return (items || []).slice(0, 12).map(x => `<div class="row"><span>${esc(x.offerName || x.offerCode)}</span><span>${esc(x.status)}</span><span>$${esc(x.priceUsd)}</span><span>${esc(x.id)}</span></div>`).join("") || `<div class="small">No receipts yet.</div>`;
}
function num(n) { return Number(n || 0).toLocaleString(); }
module.exports = { bankPage, computePage };
