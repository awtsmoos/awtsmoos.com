
// B"H

const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { body } = require("../core/request.js");
const { createApiKeyRecord } = require("../core/apiKeyStore.js");

async function createApiKey($i) {
  const ident = currentIdentity($i);

  if (!ident.ok) {
    return json($i, { BH: "B\"H", ok: false, error: ident.error }, 401);
  }

  const data = await body($i);
  const scopes = String(data.scopes || "tunnel.read tunnel.write")
    .split(/\s+/)
    .filter(Boolean);

  const made = createApiKeyRecord({
    userId: ident.userId,
    name: data.name || "Tunnel API Key",
    scopes,
    rateLimitPerMinute: data.rateLimitPerMinute || 60,
    bytesPerDay: data.bytesPerDay || 50000000
  });

  return json($i, {
    BH: "B\"H",
    ok: true,
    key: made.key,
    apiKey: made.rawKey,
    warning: "Copy this API key now. It will not be shown again."
  });
}

module.exports = { createApiKey };
