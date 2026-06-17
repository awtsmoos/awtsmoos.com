// B"H
const sandbox = require("./providerSandbox.js");
const { offerFor } = require("./purchaseService.js");
const { pushLedger } = require("./ledgerService.js");
const guard = require("./budgets/budgetGuardService.js");
const margins = require("./providers/providerMarginService.js");

const PROVIDERS = { sandbox };
const MUTATING_ACTIONS = new Set(["capture", "authorize", "renew"]);

/**
 * B"H
 * Chapter 808: Provider calls became treasury-aware.
 * Captures and renewals can now pass through budget gates and record provider
 * spread, so arbitrage stops being a spreadsheet and becomes live accounting.
 */
function providerFor(name = "sandbox") { return PROVIDERS[name] || sandbox; }
function run(store, userId, action = "preview", query = {}) {
  store.perutaProviderEvents = store.perutaProviderEvents || [];
  const providerName = query.provider || "sandbox";
  const provider = providerFor(providerName);
  const offer = offerFor(query);
  const amount = offer.amounts || {};
  if (MUTATING_ACTIONS.has(action)) {
    const gate = guard.commitSpend(store, "user", userId, amount, { userId, action: `provider_${action}`, provider: providerName, offerCode: offer.code });
    if (!gate.ok) return { ok: false, blocked: true, error: gate.error, provider: providerName, action, offer, guard: gate };
  }
  const fn = provider[action] || provider.preview;
  const result = fn({ userId, offer, query, amount: query.amount, subscriptionId: query.subscriptionId });
  let margin = null;
  if (action === "capture" && result.ok) {
    margin = margins.recordMargin(store, userId, {
      provider: providerName,
      model: query.model || offer.code,
      chargedPerutas: sumAmounts(amount),
      providerCostPerutas: Number(query.providerCostPerutas || query.cost || estimateProviderCost(amount))
    });
  }
  const event = { userId, action, provider: providerName, result, margin, at: new Date().toISOString() };
  store.perutaProviderEvents.push(event);
  pushLedger(store, { userId, kind: `provider_${action}`, provider: providerName, amounts: amount, meta: { status: result.status, offerCode: offer.code, margin } });
  return { ok: true, provider: providerName, action, offer, result, margin };
}
function history(store, userId, limit = 50) {
  return (store.perutaProviderEvents || []).filter(x => !userId || x.userId === userId).slice(-limit).reverse();
}
function estimateProviderCost(amounts = {}) { return Math.round(sumAmounts(amounts) * 0.65 * 1000) / 1000; }
function sumAmounts(amounts = {}) { return Object.values(amounts || {}).reduce((a, b) => a + Number(b || 0), 0); }
module.exports = { history, providerFor, run };
