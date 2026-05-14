
// B"H

const crypto = require("crypto");
const { normalizeTokenRequest } = require("../core/requestBody.js");
const { getClient } = require("../core/clients.js");
const { resolveServerSecret } = require("../core/serverSecret.js");

function json($i, data, status = 200) {
  try {
    $i.response.statusCode = status;
    $i.response.setHeader("Content-Type", "application/json; charset=utf-8");
    $i.response.setHeader("Cache-Control", "no-store");
  } catch (e) {}

  return JSON.stringify(data, null, 2);
}

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function sign(payload, secret) {
  return crypto
    .createHmac("sha256", String(secret))
    .update(payload)
    .digest("hex");
}

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

function findCodeRecord($i, code) {
  /**
   * This supports the common shapes used in the OAuth folder over the last few edits.
   * If your storage helper exists, it can be added here later; this fallback keeps
   * ChatGPT token parsing from failing with missing_code.
   */
  const server = $i.server || global.server || {};
  const store =
    server.oauthCodes ||
    server.oauth?.codes ||
    global.oauthCodes ||
    {};

  return store[code] || null;
}

function deleteCodeRecord($i, code) {
  const server = $i.server || global.server || {};
  const stores = [
    server.oauthCodes,
    server.oauth?.codes,
    global.oauthCodes
  ].filter(Boolean);

  for (const store of stores) {
    try {
      delete store[code];
    } catch (e) {}
  }
}

async function token($i) {
  const req = normalizeTokenRequest($i);

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

  if (client.secret && req.client_secret && req.client_secret !== client.secret) {
    return json($i, {
      BH: "B\"H",
      error: "invalid_client_secret"
    }, 401);
  }

  const record = findCodeRecord($i, req.code);

  if (!record) {
    /**
     * Safer error than pretending success.
     * If this appears, authorize.js is saving code somewhere else.
     */
    return json($i, {
      BH: "B\"H",
      error: "invalid_or_expired_code",
      codePrefix: String(req.code).slice(0, 12),
      hint: "Token request parsed correctly. Now wire token.js to the exact authorization-code store used by authorize.js."
    }, 400);
  }

  if (record.clientId && record.clientId !== client.id) {
    return json($i, {
      BH: "B\"H",
      error: "code_client_mismatch"
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

  const expiresIn = 3600;
  const secret = resolveServerSecret();

  const entry = {
    kind: "oauth_access",
    userId: record.userId,
    clientId: client.id,
    scope: record.scope || client.defaultScope || "profile tunnel.read",
    createdAt: Date.now()
  };

  const access_token = makeAccessToken(entry, secret, expiresIn);
  deleteCodeRecord($i, req.code);

  return json($i, {
    access_token,
    token_type: "Bearer",
    expires_in: expiresIn,
    scope: entry.scope
  });
}

module.exports = { token };
