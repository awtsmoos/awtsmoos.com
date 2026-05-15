
// B"H
const crypto = require("crypto");
const {
  getTokenRequest,
  getBody,
  debugRequestShape
} = require("../tools/requestData.js");
const { getClient } = require("../core/clients.js");
const { secretString } = require("../core/serverSecret.js");
const { takeCode } = require("../core/codeStore.js");
const { json } = require("../tools/respond.js");

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function sign(payload, secret) {
  return crypto.createHmac("sha256", String(secret)).update(payload).digest("hex");
}

function makeAccessToken(entry, secret, expiresIn) {
  const payload = [
    "B\"H",
    b64url({ entry, zman: Date.now(), hoshufuh: { expiresIn } })
  ].join(".");
  return payload + "." + sign(payload, secret);
}

async function missingCode($i, req) {
  const body = await getBody($i);
  return json($i, {
    BH: "B\"H",
    error: "missing_code",
    received: {
      has_client_id: !!req.client_id,
      has_redirect_uri: !!req.redirect_uri,
      grant_type: req.grant_type
    },
    request_shape: debugRequestShape($i, body)
  }, 400);
}

async function token($i) {
  const req = await getTokenRequest($i);

  if (req.grant_type !== "authorization_code") {
    return json($i, {
      BH: "B\"H",
      error: "unsupported_grant_type",
      grant_type: req.grant_type
    }, 400);
  }

  if (!req.code) return missingCode($i, req);

  const client = getClient(req.client_id || "chatgpt");
  if (!client) return json($i, { BH: "B\"H", error: "invalid_client" }, 401);

  if (!client.secretAllowed(req.client_secret)) {
    return json($i, { BH: "B\"H", error: "invalid_client_secret" }, 401);
  }

  const record = takeCode(req.code);
  if (!record) {
    return json($i, {
      BH: "B\"H",
      error: "invalid_or_expired_code",
      codePrefix: String(req.code).slice(0, 18),
      hint: "Retry OAuth from ChatGPT immediately. Codes are one-time-use and expire after 5 minutes."
    }, 400);
  }

  if (record.clientId && record.clientId !== client.id) {
    return json($i, { BH: "B\"H", error: "code_client_mismatch" }, 400);
  }

  if (record.redirectUri && req.redirect_uri && record.redirectUri !== req.redirect_uri) {
    return json($i, {
      BH: "B\"H",
      error: "redirect_uri_mismatch",
      expected: record.redirectUri,
      got: req.redirect_uri
    }, 400);
  }

  const expiresIn = client.accessTokenSeconds || 3600;
  const entry = {
    kind: "oauth_access",
    userId: record.userId,
    clientId: client.id,
    scope: record.scope || client.defaultScope || "profile tunnel.read",
    createdAt: Date.now()
  };

  return json($i, {
    access_token: makeAccessToken(entry, secretString($i), expiresIn),
    token_type: "Bearer",
    expires_in: expiresIn,
    scope: entry.scope
  });
}

module.exports = { token };
