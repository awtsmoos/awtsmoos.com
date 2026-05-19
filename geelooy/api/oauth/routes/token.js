// B"H
const crypto = require("crypto");
const { getTokenRequest, getBody, debugRequestShape } = require("../tools/requestData.js");
const { getClient } = require("../core/clients.js");
const { secretString } = require("../core/serverSecret.js");
const { takeCode } = require("../core/codeStore.js");
const {
  createRefreshRecord,
  readRefreshRecord,
  touchRefreshRecord
} = require("../core/refreshStore.js");
const { json } = require("../tools/respond.js");

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function sign(payload, secret) {
  return crypto.createHmac("sha256", String(secret)).update(payload).digest("hex");
}

function makeAccessToken(entry, secret, expiresIn) {
  const payload = ["B\"H", b64url({ entry, zman: Date.now(), hoshufuh: { expiresIn } })].join(".");
  return payload + "." + sign(payload, secret);
}

function tokenResponse($i, client, entry, refreshToken) {
  const expiresIn = client.accessTokenSeconds || 30 * 24 * 60 * 60;
  const body = {
    access_token: makeAccessToken(entry, secretString($i), expiresIn),
    token_type: "Bearer",
    expires_in: expiresIn,
    scope: entry.scope
  };

  if (refreshToken) body.refresh_token = refreshToken;
  return json($i, body);
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

async function authCodeToken($i, req, client) {
  if (!req.code) return missingCode($i, req);

  const record = takeCode(req.code);
  if (!record) {
    return json($i, {
      BH: "B\"H",
      error: "invalid_or_expired_code",
      hint: "Start OAuth again. Codes are one-time-use and expire quickly."
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

  const entry = {
    kind: "oauth_access",
    userId: record.userId,
    clientId: client.id,
    scope: record.scope || client.defaultScope || "profile tunnel.read",
    createdAt: Date.now()
  };

  const refreshToken = client.refreshTokens === false
    ? null
    : createRefreshRecord({
        userId: entry.userId,
        clientId: client.id,
        scope: entry.scope
      });

  return tokenResponse($i, client, entry, refreshToken);
}

function refreshTokenEntry(record) {
  return {
    kind: "oauth_access",
    userId: record.userId,
    clientId: record.clientId,
    scope: record.scope,
    createdAt: Date.now(),
    refreshedFrom: "refresh_token"
  };
}

function refreshGrant($i, req, client) {
  if (!req.refresh_token) {
    return json($i, { BH: "B\"H", error: "missing_refresh_token" }, 400);
  }

  const record = readRefreshRecord(req.refresh_token);
  if (!record || record.revoked) {
    return json($i, { BH: "B\"H", error: "invalid_refresh_token" }, 401);
  }

  if (record.expiresAt && record.expiresAt < Date.now()) {
    return json($i, { BH: "B\"H", error: "expired_refresh_token" }, 401);
  }

  if (record.clientId && record.clientId !== client.id) {
    return json($i, { BH: "B\"H", error: "refresh_client_mismatch" }, 400);
  }

  touchRefreshRecord(req.refresh_token);
  return tokenResponse($i, client, refreshTokenEntry(record), req.refresh_token);
}

async function token($i) {
  const req = await getTokenRequest($i);
  const client = getClient(req.client_id || "chatgpt");
  if (!client) return json($i, { BH: "B\"H", error: "invalid_client" }, 401);

  if (!client.secretAllowed(req.client_secret)) {
    return json($i, { BH: "B\"H", error: "invalid_client_secret" }, 401);
  }

  if (req.grant_type === "authorization_code") return await authCodeToken($i, req, client);
  if (req.grant_type === "refresh_token") return refreshGrant($i, req, client);

  return json($i, { BH: "B\"H", error: "unsupported_grant_type", grant_type: req.grant_type }, 400);
}

module.exports = { token };
