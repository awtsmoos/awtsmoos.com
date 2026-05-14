
// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { body, query } = require("../core/request.js");
const { revokeApiKeyRecord } = require("../core/apiKeyStore.js");

async function revokeApiKey($i) {
  const ident = currentIdentity($i);

  if (!ident.ok) {
    return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  }

  const data = { ...query($i), ...(await body($i)) };
  const keyId = data.keyId;

  if (!keyId) {
    return json($i, { BH: "B\"H", ok: false, error: "missing_keyId" }, 400);
  }

  return json($i, {
    BH: "B\"H",
    ok: revokeApiKeyRecord(ident.userId, keyId)
  });
}

module.exports = { revokeApiKey };
