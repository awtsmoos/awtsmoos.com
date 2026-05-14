
// B"H
const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { captureOrder } = require("../core/paypal.js");
const { credit } = require("../core/store.js");

function query($i, name, fallback = "") {
  const q = $i.paramKinds?.GET || $i.$_GET || {};
  return q[name] ?? fallback;
}

async function paypalCapture($i) {
  const user = requireUser($i);

  if (!user.ok) return json($i, { BH: "B\"H", ok: false, ...user }, 401);

  try {
    const orderId = query($i, "orderId", "");

    if (!orderId) {
      return json($i, { BH: "B\"H", ok: false, error: "missing_orderId" }, 400);
    }

    const captured = await captureOrder(orderId);
    const unit = captured.purchase_units?.[0] || {};
    const custom = unit.payments?.captures?.[0]?.custom_id || unit.custom_id || "";
    const parts = String(custom).split(":");
    const perutahs = Math.max(0, Number(parts[1] || 0));

    if (!perutahs) {
      return json($i, { BH: "B\"H", ok: false, error: "could_not_determine_perutahs", captured }, 500);
    }

    const wallet = await credit(user.userId, perutahs, { kind: "paypal_capture", orderId });

    return json($i, { BH: "B\"H", ok: true, perutahs, captured, wallet });
  } catch (e) {
    return json($i, { BH: "B\"H", ok: false, error: e.message }, 500);
  }
}

module.exports = { paypalCapture };
