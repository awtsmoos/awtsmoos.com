// B"H
const { normalizeAmounts } = require("../accountService.js");
const { pushLedger } = require("../ledgerService.js");
const { ORDER, zeroWorldTotals } = require("../resourceWorldService.js");

const DEFAULT_RATE = 0.15;

/**
 * B"H
 * Chapter 803: The market gave a tenth and a half-tenth to the platform.
 * The creator is paid, the treasury receives its cut, and every category remains
 * separate so no coin forgets which world it came from.
 */
function split(price, rate = DEFAULT_RATE) {
  const got = normalizeAmounts(price);
  const commission = zeroWorldTotals();
  const seller = zeroWorldTotals();
  for (const key of ORDER) {
    commission[key] = round(Number(got[key] || 0) * Number(rate || 0));
    seller[key] = round(Number(got[key] || 0) - commission[key]);
  }
  return { rate, price: got, commission, seller };
}
function recordSettlement(store, input = {}) {
  store.perutaMarketplaceCommissions = store.perutaMarketplaceCommissions || [];
  const settlement = {
    id: input.id || `comm_${Date.now().toString(36)}_${Math.random().toString(16).slice(2, 8)}`,
    orderId: input.orderId || null,
    serviceId: input.serviceId || null,
    buyerId: input.buyerId || null,
    sellerId: input.sellerId || null,
    agentId: input.agentId || null,
    organizationId: input.organizationId || null,
    ...split(input.price || input.amounts || {}, input.rate || DEFAULT_RATE),
    createdAt: new Date().toISOString()
  };
  store.perutaMarketplaceCommissions.push(settlement);
  pushLedger(store, { userId: input.buyerId, kind: "marketplace_commission_taken", orderId: settlement.orderId, serviceId: settlement.serviceId, amounts: settlement.commission, meta: settlement });
  pushLedger(store, { userId: input.sellerId, kind: "marketplace_creator_paid", orderId: settlement.orderId, serviceId: settlement.serviceId, amounts: settlement.seller, meta: settlement });
  return settlement;
}
function summary(store) {
  const rows = store.perutaMarketplaceCommissions || [];
  const totals = { commission: zeroWorldTotals(), seller: zeroWorldTotals() };
  for (const row of rows) for (const key of ORDER) {
    totals.commission[key] += Number(row.commission?.[key] || 0);
    totals.seller[key] += Number(row.seller?.[key] || 0);
  }
  return { ok: true, count: rows.length, totals, recent: rows.slice(-20).reverse() };
}
function round(n) { return Math.round(Number(n || 0) * 1000) / 1000; }
module.exports = { DEFAULT_RATE, recordSettlement, split, summary };
