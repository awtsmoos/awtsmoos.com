// B"H
const crypto = require("crypto");
const { pushLedger } = require("./ledgerService.js");
const { worldFor } = require("./resourceWorldService.js");

/**
 * B"H
 * Chapter 705: The receipt became a scroll with a seal.
 * A sandbox purchase still remains sandbox, yet the certificate gives every
 * before/after balance, line item, ledger link, and deterministic signature.
 */
function createReceipt(store, userId, offer, before, after, meta = {}) {
  store.perutaReceipts = store.perutaReceipts || [];
  const receipt = {
    id: meta.receiptId || newId(),
    userId,
    status: meta.status || "SIMULATED_CAPTURED",
    provider: meta.provider || "sandbox",
    providerRef: meta.providerRef || null,
    kind: offer.kind,
    offerCode: offer.code,
    offerName: offer.name,
    tier: offer.tier || null,
    priceUsd: Number(offer.priceUsd || 0),
    createdAt: meta.createdAt || new Date().toISOString(),
    before: cloneBalances(before),
    after: cloneBalances(after),
    lineItems: lineItems(offer.amounts),
    ledgerIds: [],
    links: {}
  };
  receipt.signature = signatureFor(receipt);
  store.perutaReceipts.push(receipt);
  trim(store.perutaReceipts, 10000);
  const ledger = pushLedger(store, {
    userId,
    kind: "receipt_created",
    receiptId: receipt.id,
    amounts: offer.amounts,
    balances: receipt.after,
    meta: { offerCode: offer.code, provider: receipt.provider, signature: receipt.signature }
  });
  receipt.ledgerIds.push(ledger.id);
  receipt.links = receiptLinks(receipt.id);
  return receipt;
}
function certificateFor(store, userId, receiptId) {
  const receipt = receiptFor(store, userId, receiptId);
  if (!receipt) return null;
  return { receipt, html: certificateHtml(receipt), signature: receipt.signature || signatureFor(receipt) };
}
function certificateHtml(receipt) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Receipt ${esc(receipt.id)}</title><style>${certificateCss()}</style></head><body><main><div class="seal">ב״ה</div><h1>Treasury Allocation Certificate</h1><p class="sub">${esc(receipt.offerName)} · ${esc(receipt.status)} · ${esc(receipt.provider)}</p><section>${receipt.lineItems.map(item => `<article><b>${esc(worldFor(item.category).name)}</b><span>${esc(item.category)}</span><strong>${Number(item.amount || 0).toLocaleString()}</strong></article>`).join("")}</section><h2>Before / After</h2><pre>${esc(JSON.stringify({ before: receipt.before, after: receipt.after }, null, 2))}</pre><footer>${esc(receipt.id)} · ${esc(receipt.signature || signatureFor(receipt))}</footer></main></body></html>`;
}
function certificateCss() {
  return `body{margin:0;background:#120b05;color:#ffe9b0;font-family:Georgia,serif}main{max-width:920px;margin:30px auto;padding:34px;border:2px solid #d9aa48;border-radius:32px;background:radial-gradient(circle at 50% 0,#5a3714,#160d06 55%);box-shadow:0 30px 90px #000}.seal{width:96px;height:96px;border-radius:50%;display:grid;place-items:center;border:2px solid #d9aa48;color:#ffd36a;font-size:38px;margin:auto;box-shadow:0 0 34px #d9aa48}h1{text-align:center;font-size:clamp(34px,7vw,70px);margin:18px 0}.sub{text-align:center;color:#e4c37b}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px}article{padding:18px;border:1px solid #d9aa4888;border-radius:20px;background:#0004}article b,article span,article strong{display:block}article strong{font-size:30px;color:#fff}pre{white-space:pre-wrap;background:#0007;padding:18px;border-radius:18px}footer{text-align:center;color:#cda85c;margin-top:22px;font-size:12px}`;
}
function receiptFor(store, userId, receiptId) {
  const found = (store.perutaReceipts || []).find(x => x.id === receiptId);
  if (!found || (userId && found.userId !== userId)) return null;
  return found;
}
function receiptHistory(store, userId, limit = 50) {
  return (store.perutaReceipts || []).filter(x => x.userId === userId).slice(-limit).reverse();
}
function receiptLinks(id) {
  return { json: `/api/tunnel/control/compute/receipt?id=${encodeURIComponent(id)}&format=json`, certificate: `/api/tunnel/control/receipt/certificate?id=${encodeURIComponent(id)}` };
}
function lineItems(amounts = {}) {
  return ["routing", "compute", "storage", "gpu"].map(category => ({ category, world: worldFor(category), amount: Number(amounts[category] || 0) }));
}
function cloneBalances(value = {}) { return { routing: Number(value.routing || 0), compute: Number(value.compute || 0), storage: Number(value.storage || 0), gpu: Number(value.gpu || 0) }; }
function signatureFor(receipt) { return crypto.createHash("sha256").update(JSON.stringify({ id: receipt.id, userId: receipt.userId, after: receipt.after, lineItems: receipt.lineItems })).digest("hex").slice(0, 32); }
function newId() { return `rcpt_${Date.now().toString(36)}_${crypto.randomBytes(5).toString("hex")}`; }
function trim(list, max) { while (list.length > max) list.shift(); }
function esc(x) { return String(x ?? "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
module.exports = { certificateFor, createReceipt, receiptFor, receiptHistory, receiptLinks, signatureFor };
