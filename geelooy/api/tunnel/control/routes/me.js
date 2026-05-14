
// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");

async function me($i) {
  const ident = currentIdentity($i);

  return json($i, {
    BH: "B\"H",
    ok: !!ident.ok,
    identity: ident.ok ? ident : null,
    error: ident.ok ? null : ident.error,
    loginUrl: "/login"
  }, ident.ok ? 200 : 401);
}

module.exports = { me };
