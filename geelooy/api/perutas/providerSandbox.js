// B"H
const crypto = require("crypto");

/** B"H: Sandbox provider rehearses payment without leaving the local treasury. */
function preview(input = {}) {
  const offer = input.offer || {};
  return base("preview", offer, { approvalUrl: `/api/tunnel/control/provider?action=capture&provider=sandbox&orderId=${id()}` });
}
function authorize(input = {}) {
  return base("authorized", input.offer || {}, { authorizationId: `auth_${id()}` });
}
function capture(input = {}) {
  return base("captured", input.offer || {}, { captureId: `cap_${id()}` });
}
function refund(input = {}) {
  return { ok: true, provider: "sandbox", status: "refunded", refundId: `rf_${id()}`, amount: input.amount || null, at: new Date().toISOString() };
}
function cancel(input = {}) {
  return { ok: true, provider: "sandbox", status: "canceled", subscriptionId: input.subscriptionId || null, at: new Date().toISOString() };
}
function renew(input = {}) {
  return { ok: true, provider: "sandbox", status: "renewed", subscriptionId: input.subscriptionId || null, at: new Date().toISOString() };
}
function base(status, offer, extra) {
  return { ok: true, provider: "sandbox", status, orderId: `ord_${id()}`, offerCode: offer.code || null, priceUsd: Number(offer.priceUsd || 0), at: new Date().toISOString(), ...extra };
}
function id() { return crypto.randomBytes(6).toString("hex"); }
module.exports = { authorize, cancel, capture, preview, refund, renew };
