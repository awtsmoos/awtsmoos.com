
// B"H
const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");
const { getWallet } = require("../core/store.js");
const { COINS, PERUTAH_USD_CENTS } = require("../core/currency.js");

async function balance($i) {
  const user = requireUser($i);

  if (!user.ok) return json($i, { BH: "B\"H", ok: false, ...user }, 401);

  const wallet = await getWallet(user.userId);

  return json($i, {
    BH: "B\"H",
    ok: true,
    wallet,
    coinSystem: COINS,
    perutahUsdCents: PERUTAH_USD_CENTS
  });
}

module.exports = { balance };
