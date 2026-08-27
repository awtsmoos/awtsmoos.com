// B"H
const crypto = require("crypto");
const { accountFor, normalizeAmounts } = require("./accountService.js");
const { pushLedger } = require("./ledgerService.js");

/** B"H: Refunds are explicit treasury reversals, not silent balance edits. */
function issueRefund(store, userId, input = {}) {
  store.perutaRefunds = store.perutaRefunds || [];
  const account = accountFor(store, userId, input);
  const amounts = normalizeAmounts(input.amounts || input);
  for (const key of Object.keys(amounts)) account.balances[key] = Number(account.balances[key] || 0) - Number(amounts[key] || 0);
  const refund = {
    id: input.id || `refund_${crypto.randomBytes(6).toString("hex")}`,
    userId, receiptId: input.receiptId || null, provider: input.provider || "sandbox",
    status: "SIMULATED_REFUNDED", amounts, createdAt: new Date().toISOString(), reason: input.reason || "sandbox_refund"
  };
  store.perutaRefunds.push(refund);
  pushLedger(store, { userId, kind: "refund_issued", refundId: refund.id, receiptId: refund.receiptId, amounts: negate(amounts), balances: account.balances, meta: refund });
  return { ok: true, refund, account };
}
function history(store, userId, limit = 50) {
  return (store.perutaRefunds || []).filter(x => !userId || x.userId === userId).slice(-limit).reverse();
}
function negate(amounts) { return Object.fromEntries(Object.entries(amounts).map(([k, v]) => [k, -Number(v || 0)])); }
module.exports = { history, issueRefund };
