
// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { listApiKeys } = require("../core/apiKeyStore.js");

async function apiKeys($i) {
  const ident = currentIdentity($i);

  if (!ident.ok) {
    return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  }

  return json($i, {
    BH: "B\"H",
    ok: true,
    keys: listApiKeys(ident.userId)
  });
}

module.exports = { apiKeys };
