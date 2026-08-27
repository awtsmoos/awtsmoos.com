
// B"H
const { json } = require("../core/respond.js");
const { requireUser } = require("../core/user.js");

async function me($i) {
  const user = requireUser($i);

  if (!user.ok) return json($i, { BH: "B\"H", ok: false, ...user }, 401);

  return json($i, { BH: "B\"H", ok: true, userId: user.userId });
}

module.exports = { me };
