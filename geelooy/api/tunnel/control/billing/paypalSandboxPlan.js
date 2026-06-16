// B"H

const SANDBOX_BASE_URL = "https://api-m.sandbox.paypal.com";
const BASE_PRICE = Object.freeze({ usd: 1, perutas: 100000, label: "$1 = 100,000 perutas base rate" });

/**
 * B"H
 * Chapter: PayPal remained a sandbox, but the coin table learned its price.
 *
 * No secrets live here. These payloads are safe test shapes for PayPal Orders
 * v2 create/capture routes. Real capture should verify PayPal status before
 * crediting perutas.
 */
const PERUTA_PACKS = Object.freeze({
  handful: { sku: "peruta-handful", dollars: "1.00", perutas: 100000, bonus: 0, description: "100,000 Awtsmoos Compute perutas" },
  supporter: { sku: "peruta-supporter", dollars: "3.00", perutas: 350000, bonus: 50000, description: "350,000 Awtsmoos Compute perutas" },
  builder: { sku: "peruta-builder", dollars: "5.00", perutas: 750000, bonus: 250000, description: "750,000 Awtsmoos Compute perutas" },
  pro: { sku: "peruta-pro", dollars: "10.00", perutas: 2500000, bonus: 1500000, description: "2,500,000 Awtsmoos Compute perutas" },
  studio: { sku: "peruta-studio", dollars: "25.00", perutas: 10000000, bonus: 7500000, description: "10,000,000 Awtsmoos Compute perutas" }
});

function packValue(pack) {
  const dollars = Number(pack.dollars || 0);
  return { ...pack, dollars, perutasPerDollar: dollars ? Math.round(pack.perutas / dollars) : 0, basePerutas: dollars * BASE_PRICE.perutas };
}

function packList() {
  return Object.entries(PERUTA_PACKS).map(([key, pack]) => ({ key, ...packValue(pack) }));
}

function sandboxEndpoints(baseUrl = SANDBOX_BASE_URL) {
  return { token: `${baseUrl}/v1/oauth2/token`, createOrder: `${baseUrl}/v2/checkout/orders`, captureOrder: orderId => `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture` };
}

function createOrderPayload(packName, returnUrl, cancelUrl) {
  const pack = PERUTA_PACKS[packName] || PERUTA_PACKS.handful;
  return { intent: "CAPTURE", purchase_units: [{ reference_id: pack.sku, description: pack.description, amount: { currency_code: "USD", value: pack.dollars }, custom_id: JSON.stringify({ packName, perutas: pack.perutas }) }], application_context: { return_url: returnUrl, cancel_url: cancelUrl, user_action: "PAY_NOW" } };
}

function fakeApproval(packName, origin = "https://awtsmoos.com") {
  const pack = PERUTA_PACKS[packName] || PERUTA_PACKS.handful;
  const orderId = `SANDBOX-${pack.sku}-${Date.now()}`;
  return { ok: true, sandbox: true, orderId, packName, pack: packValue(pack), approveUrl: `${origin}/compute?sandboxOrder=${encodeURIComponent(orderId)}&pack=${encodeURIComponent(packName)}`, captureUrl: `/api/tunnel/control/compute/capture?sandboxOrder=${encodeURIComponent(orderId)}&pack=${encodeURIComponent(packName)}` };
}

function perutasFromCapturedOrder(order = {}) {
  const unit = (order.purchase_units || [])[0] || {};
  try {
    const parsed = JSON.parse(unit.custom_id || "{}");
    return Math.max(0, Number(parsed.perutas || 0));
  } catch (_) {
    const pack = Object.values(PERUTA_PACKS).find(item => item.sku === unit.reference_id);
    return pack ? pack.perutas : 0;
  }
}

module.exports = { BASE_PRICE, PERUTA_PACKS, SANDBOX_BASE_URL, createOrderPayload, fakeApproval, packList, perutasFromCapturedOrder, sandboxEndpoints };
