// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { addPerutas, PLANS, PURCHASE_URL, usageSummary } = require("../core/usageStore.js");
const { BASE_PRICE, createOrderPayload, fakeApproval, packList, PERUTA_PACKS } = require("../billing/paypalSandboxPlan.js");
const { COINS, convertCoin, convertPerutas } = require("../billing/talmudicCoins.js");

/**
 * B"H
 * Chapter: The compute gate became a little Beis Midrash of coins.
 */
async function compute($i) {
  const ident = currentIdentity($i);
  const GET = $i?.paramKinds?.GET || {};
  const pack = String(GET.pack || "handful");
  const amount = Number(GET.amount || GET.perutas || 100000);
  const coin = String(GET.coin || "peruta");
  const usage = ident.ok ? usageSummary(ident.userId) : null;
  const sandboxOrder = fakeApproval(pack, "https://awtsmoos.com");
  return json($i, {
    BH: "B\"H",
    ok: true,
    canonicalUrl: PURCHASE_URL,
    title: "Awtsmoos Compute",
    basePrice: BASE_PRICE,
    packs: packList(),
    sandboxOrder,
    sandboxCreateOrderPayload: createOrderPayload(pack, `${PURCHASE_URL}?success=1`, `${PURCHASE_URL}?cancel=1`),
    selected: { pack, coin, amount, conversion: convertCoin(amount, coin), perutaConversions: convertPerutas(amount) },
    coins: COINS,
    description: "Perutas are tiny compute credits. The coin table is educational and playful; billing is still exact peruta accounting.",
    talmudicNote: "Awtsmoos displays the requested Rambam-style ladder: isar, pundyon, me'ah/gerah, dinar, sela, darkon, plus the Moshe shekel weight comparison.",
    plans: PLANS,
    current: usage,
    guidance: "Sandbox only for now: use /api/tunnel/control/compute?pack=builder to inspect a PayPal Orders v2 test payload. A future capture route should verify PayPal before crediting perutas."
  });
}

async function computeCapture($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  const GET = $i?.paramKinds?.GET || {};
  const packName = String(GET.pack || "handful");
  const pack = PERUTA_PACKS[packName] || PERUTA_PACKS.handful;
  const credited = addPerutas(ident.userId, pack.perutas, { kind: "paypal_sandbox_capture", plan: packName, sandboxOrder: GET.sandboxOrder || null, pack });
  return json($i, { BH: "B\"H", ok: true, sandbox: true, credited, usage: usageSummary(ident.userId), warning: "Sandbox capture credited perutas without contacting PayPal. Production must verify PayPal capture status first." });
}

module.exports = { compute, computeCapture };
