
// B"H

const crypto = require("crypto");
const { getTokenRequest } = require("../tools/requestData.js");
const { getClient } = require("../core/clients.js");
const { resolveServerSecret } = require("../core/serverSecret.js");
const { takeCode } = require("../core/codeStore.js");
const { json } = require("../tools/respond.js");

/**
 * B"H
 * Base64-url encodes JSON.
 *
 * @param {object} obj Object.
 * @returns {string}
 */
function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

/**
 * B"H
 * HMAC signature for Awtsmoos token.
 *
 * @param {string} payload Token payload.
 * @param {string} secret Secret.
 * @returns {string}
 */
function sign(payload, secret) {
  return crypto
    .createHmac("sha256", String(secret))
    .update(payload)
    .digest("hex");
}

/**
 * B"H
 * Creates access token.
 *
 * @param {object} entry Token entry.
 * @param {string} secret Server secret.
 * @param {number} expiresIn Expiry seconds.
 * @returns {string}
 */
function makeAccessToken(entry, secret, expiresIn) {
  const payload = [
    "B\"H",
    b64url({
      entry,
      zman: Date.now(),
      hoshufuh: {
        expiresIn
      }
    })
  ].join(".");

  return payload + "." + sign(payload, secret);
}

/**
 * B"H
 * OAuth token endpoint for ChatGPT Actions.
 *
 * @param {object} $i Awtsmoos dynamic route context.
 * @returns {Promise<object>}
 */
async function token($i) {
  const req = await getTokenRequest($i);

  if (req.grant_type !== "authorization_code") {
    return json($i, {
      BH: "B\"H",
      error: "unsupported_grant_type",
      grant_type: req.grant_type
    }, 400);
  }

  if (!req.code) {
    return json($i, {
      BH: "B\"H",
      error: "missing_code",
      received: {
        has_client_id: !!req.client_id,
        has_redirect_uri: !!req.redirect_uri,
        grant_type: req.grant_type
      }
    }, 400);
  }

  const client = getClient(req.client_id || "chatgpt");

  if (!client) {
    return json($i, {
      BH: "B\"H",
      error: "invalid_client"
    }, 401);
  }

  if (!client.secretAllowed(req.client_secret)) {
    return json($i, {
      BH: "B\"H",
      error: "invalid_client_secret"
    }, 401);
  }

  const record = takeCode(req.code);

  if (!record) {
    return json($i, {
      BH: "B\"H",
      error: "invalid_or_expired_code",
      codePrefix: String(req.code).slice(0, 18),
      hint: "Code parsed, but not found. Retry immediately after authorize; code TTL is 5 minutes and one-time-use."
    }, 400);
  }

  if (record.clientId && record.clientId !== client.id) {
    return json($i, {
      BH: "B\"H",
      error: "code_client_mismatch",
      expected: record.clientId,
      got: client.id
    }, 400);
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
  const secret = resolveServerSecret();

  const entry = {
    kind: "oauth_access",
    userId: record.userId,
    clientId: client.id,
    scope: record.scope || client.defaultScope || "profile tunnel.read",
    createdAt: Date.now()
  };

  const access_token = makeAccessToken(entry, secret, expiresIn);

  return json($i, {
    access_token,
    token_type: "Bearer",
    expires_in: expiresIn,
    scope: entry.scope
  });
}

module.exports = { token };
