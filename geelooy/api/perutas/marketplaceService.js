// B"H
const crypto = require("crypto");
const { accountFor, normalizeAmounts } = require("./accountService.js");
const agents = require("./agentEconomyService.js");
const commissions = require("./marketplace/commissionService.js");
const guard = require("./budgets/budgetGuardService.js");
const { pushLedger } = require("./ledgerService.js");

/**
 * B"H
 * Chapter 807: The marketplace bridge now collects its toll automatically.
 * Buyers are budget-checked, creators are paid after the platform cut, and the
 * commission ledger no longer depends on a separate demo route.
 */
function listService(store, ownerId, input = {}) {
  store.perutaMarketplace = store.perutaMarketplace || { services: {}, orders: {} };
  const id = input.id || `svc_${crypto.randomBytes(5).toString("hex")}`;
  const service = {
    id,
    ownerId,
    agentId: input.agentId || null,
    organizationId: input.organizationId || null,
    title: input.title || "Awtsmoos Service",
    description: input.description || "A simulated treasury-backed service.",
    price: normalizeAmounts(input.price || { routing: 1000, compute: 50, storage: 0, gpu: 0 }),
    commissionRate: Number(input.commissionRate || input.rate || commissions.DEFAULT_RATE),
    status: "listed",
    createdAt: new Date().toISOString()
  };
  store.perutaMarketplace.services[id] = service;
  pushLedger(store, { userId: ownerId, kind: "marketplace_service_listed", serviceId: id, agentId: service.agentId, amounts: service.price });
  return clone(service);
}
function purchase(store, buyerId, serviceId, meta = {}) {
  const service = mustService(store, serviceId);
  const buyer = accountFor(store, buyerId, meta);
  const price = normalizeAmounts(service.price);
  const gate = guard.guardAndCommitMany(store, [
    { entityType: "user", entityId: buyerId, amounts: price, meta: { serviceId, action: "marketplace_purchase" } },
    service.agentId ? { entityType: "agent", entityId: service.agentId, amounts: price, meta: { serviceId, action: "marketplace_delivery" } } : null
  ].filter(Boolean), { userId: buyerId, serviceId });
  if (!gate.ok) return { ok: false, blocked: true, error: gate.error, guard: gate, service: clone(service) };
  const settlement = commissions.recordSettlement(store, {
    buyerId,
    sellerId: service.ownerId,
    agentId: service.agentId,
    organizationId: service.organizationId,
    serviceId,
    price,
    rate: service.commissionRate
  });
  for (const key of Object.keys(price)) buyer.balances[key] = Number(buyer.balances[key] || 0) - Number(price[key] || 0);
  if (service.agentId) agents.income(store, service.agentId, settlement.seller, { userId: buyerId, serviceId, source: "marketplace", settlementId: settlement.id });
  store.perutaMarketplace.orders = store.perutaMarketplace.orders || {};
  const order = {
    id: `mkt_${crypto.randomBytes(5).toString("hex")}`,
    buyerId,
    serviceId,
    agentId: service.agentId,
    organizationId: service.organizationId,
    price,
    settlement,
    status: "SIMULATED_SETTLED",
    createdAt: new Date().toISOString()
  };
  store.perutaMarketplace.orders[order.id] = order;
  pushLedger(store, { userId: buyerId, kind: "marketplace_purchase", serviceId, agentId: service.agentId, amounts: negate(price), balances: buyer.balances, meta: { ...meta, budgetGate: gate, settlementId: settlement.id } });
  pushLedger(store, { userId: service.ownerId, kind: "marketplace_settlement", serviceId, agentId: service.agentId, amounts: settlement.seller, meta: { orderId: order.id, settlementId: settlement.id } });
  return clone(order);
}
function summary(store) {
  const market = store.perutaMarketplace || { services: {}, orders: {} };
  return { services: Object.values(market.services || {}).map(clone), orders: Object.values(market.orders || {}).map(clone), commissions: commissions.summary(store) };
}
function serviceFor(store, serviceId) { const service = (store.perutaMarketplace?.services || {})[serviceId]; return service ? clone(service) : null; }
function mustService(store, serviceId) { const service = (store.perutaMarketplace?.services || {})[serviceId]; if (!service) throw new Error(`service_not_found:${serviceId}`); return service; }
function negate(amounts) { return Object.fromEntries(Object.entries(amounts).map(([key, value]) => [key, -Number(value || 0)])); }
function clone(value) { return JSON.parse(JSON.stringify(value)); }
module.exports = { listService, purchase, serviceFor, summary };
