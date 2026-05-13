
// B"H

const { json } = require("../tools/respond.js");
const { getQuery, getBody } = require("../tools/requestData.js");
const { getClient } = require("../core/clients.js");
const { readCode, consumeCode } = require("../core/codeStore.js");
const { createAccessToken } = require("../core/tokenMaker.js");

/**
 * B"H
 * Exchanges a temporary authorization code for a bearer token.
 * The code is a spark, brief and burning.
 * The token is a vessel, timed and scoped.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Promise<object>} OAuth token JSON response.
 */
async function token($i) {
  const q = getQuery($i);
  const body = await getBody($i);
  const data = { ...q, ...body };

  const grantType = data.grant_type || "authorization_code";
  const code = data.code;
  const clientId = data.client_id || "chatgpt";
  const clientSecret = data.client_secret || "";
  const client = getClient(clientId);

  if (grantType !== "authorization_code") {
    return json($i, { error: "unsupported_grant_type" }, 400);
  }

  if (!client.secretAllowed(clientSecret)) {
    return json($i, { error: "invalid_client" }, 401);
  }

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

  return json($i, {
    access_token: made.accessToken,
    token_type: "Bearer",
    expires_in: client.accessTokenSeconds,
    scope: rec.scope
  });
}

module.exports = { token };
