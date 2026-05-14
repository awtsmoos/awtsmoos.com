
// B"H

const { json } = require("../tools/respond.js");
const { getQuery, getBody } = require("../tools/requestData.js");
const { getClient } = require("../core/clients.js");
const { readCode, consumeCode } = require("../core/codeStore.js");
const { createAccessToken } = require("../core/tokenMaker.js");
const {
  createRefreshRecord,
  readRefreshRecord,
  touchRefreshRecord
} = require("../core/refreshStore.js");

/**
 * B"H
 * Makes a new OAuth access token response.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {object} rec OAuth identity record.
 * @param {object} client OAuth client.
 * @param {boolean} includeRefresh Whether to issue refresh token.
 * @returns {object} Dynamic JSON response.
 */
function makeTokenResponse($i, rec, client, includeRefresh) {
  const made = createAccessToken($i, {
    kind: "oauth_access",
    userId: rec.userId,
    clientId: rec.clientId,
    scope: rec.scope,
    createdAt: Date.now()
  }, client.accessTokenSeconds);

  if (!made.ok) {
    return json($i, { error: "token_creation_failed", details: made.error }, 500);
  }

  const out = {
    access_token: made.accessToken,
    token_type: "Bearer",
    expires_in: client.accessTokenSeconds,
    scope: rec.scope
  };

  if (includeRefresh) {
    out.refresh_token = createRefreshRecord({
      userId: rec.userId,
      clientId: rec.clientId,
      scope: rec.scope
    });
  }

  return json($i, out);
}

/**
 * B"H
 * Authorization-code grant.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {object} data Request data.
 * @param {object} client OAuth client.
 * @returns {Promise<object>} Token response.
 */
async function authorizationCodeGrant($i, data, client) {
  const code = data.code;

  if (!code) {
    return json($i, { error: "missing_code" }, 400);
  }

  const rec = await readCode(code);

  if (!rec || rec.used) {
    return json($i, { error: "invalid_grant" }, 400);
  }

  if (Date.now() > rec.expiresAt) {
    return json($i, { error: "expired_code" }, 400);
  }

  if (rec.clientId !== client.id) {
    return json($i, { error: "client_mismatch" }, 400);
  }

  if (data.redirect_uri && data.redirect_uri !== rec.redirectUri) {
    return json($i, { error: "redirect_uri_mismatch" }, 400);
  }

  await consumeCode(code);

  return makeTokenResponse($i, rec, client, true);
}

/**
 * B"H
 * Refresh-token grant.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {object} data Request data.
 * @param {object} client OAuth client.
 * @returns {object} Token response.
 */
function refreshTokenGrant($i, data, client) {
  const refreshToken = data.refresh_token;

  if (!refreshToken) {
    return json($i, { error: "missing_refresh_token" }, 400);
  }

  const rec = readRefreshRecord(refreshToken);

  if (!rec || rec.revoked) {
    return json($i, { error: "invalid_refresh_token" }, 401);
  }

  if (Date.now() > rec.expiresAt) {
    return json($i, { error: "expired_refresh_token" }, 401);
  }

  if (rec.clientId !== client.id) {
    return json($i, { error: "client_mismatch" }, 400);
  }

  touchRefreshRecord(refreshToken);

  return makeTokenResponse($i, rec, client, false);
}

/**
 * B"H
 * OAuth token endpoint.
 *
 * Supports:
 * - authorization_code
 * - refresh_token
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Promise<object>} OAuth token JSON response.
 */
async function token($i) {
  const q = getQuery($i);
  const body = await getBody($i);
  const data = { ...q, ...body };

  const grantType = data.grant_type || "authorization_code";
  const clientId = data.client_id || "chatgpt";
  const clientSecret = data.client_secret || "";
  const client = getClient(clientId);

  if (!client.secretAllowed(clientSecret)) {
    return json($i, { error: "invalid_client" }, 401);
  }

  if (grantType === "authorization_code") {
    return await authorizationCodeGrant($i, data, client);
  }

  if (grantType === "refresh_token") {
    return refreshTokenGrant($i, data, client);
  }

  return json($i, {
    error: "unsupported_grant_type",
    error_description: "Use authorization_code or refresh_token."
  }, 400);
}

module.exports = { token };
