
// B"H
const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { createOrder } = require("../core/paypal.js");

function query($i, name, fallback = "") {
  const q = $i.paramKinds?.GET || $i.$_GET || {};
  return q[name] ?? fallback;
}

async function paypalCreate($i) {
  const user = requireUser($i);

  if (!user.ok) return json($i, { BH: "B\"H", ok: false, ...user }, 401);

  try {
    const dollars = Math.min(250, Math.max(1, Number(query($i, "dollars", 5))));
    const origin = "https://awtsmoos.com";
    const order = await createOrder({
      dollars,
      userId: user.userId,
      returnUrl: origin + "/apps/wallet/?paypalReturn=1",
      cancelUrl: origin + "/apps/wallet/?paypalCancel=1"
    });

    return json($i, { BH: "B\"H", ok: true, dollars, order });
  } catch (e) {
    return json($i, { BH: "B\"H", ok: false, error: e.message, setupNeeded: "Set PAYPAL_CLIENT_SECRET on the server. Client ID alone is not enough." }, 500);
  }
}

module.exports = { paypalCreate };
