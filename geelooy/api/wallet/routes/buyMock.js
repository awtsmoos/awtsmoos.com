
// B"H
const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { credit } = require("../core/store.js");
const { usdToPerutahs } = require("../core/currency.js");

function query($i, name, fallback = "") {
  const q = $i.paramKinds?.GET || $i.$_GET || {};
  return q[name] ?? fallback;
}

async function buyMock($i) {
  const user = requireUser($i);

  if (!user.ok) return json($i, { BH: "B\"H", ok: false, ...user }, 401);

  const dollars = Math.min(100, Math.max(1, Number(query($i, "dollars", 5))));
  const perutahs = usdToPerutahs(dollars);
  const wallet = await credit(user.userId, perutahs, { kind: "mock_purchase", dollars });

  return json($i, {
    BH: "B\"H",
    ok: true,
    simulated: true,
    dollars,
    perutahs,
    wallet
  });
}

module.exports = { buyMock };
