
// B"H

const { readBearer } = require("../../../oauth/core/tokenReader.js");
const { verifyApiKey } = require("./apiKeyStore.js");

/**
 * B"H
 * Safely reads request headers from the Awtsmoos route context.
 *
 * Node lowercases headers, but some wrappers may preserve casing.
 *
 * @param {object} $i Route context.
 * @param {string} name Header name.
 * @returns {string}
 */
function header($i, name) {
  const headers = $i.request?.headers || {};
  const lower = String(name).toLowerCase();

  return (
    headers[lower] ||
    headers[name] ||
    headers[name.toLowerCase()] ||
    headers[name.toUpperCase()] ||
    ""
  );
}

/**
 * B"H
 * Gets API key identity.
 *
 * IMPORTANT:
 * This must be checked BEFORE browser session identity. Otherwise a logged-in
 * dashboard user with a valid x-awtsmoos-api-key gets seen as "session", and
 * protected file actions reject them as session-only calls.
 *
 * Supported:
 * - x-awtsmoos-api-key: ak_...
 * - Authorization: AwtsmoosKey ak_...
 * - Authorization: ApiKey ak_...
 *
 * @param {object} $i Route context.
 * @returns {object|null}
 */
function apiKeyIdentity($i) {
  const explicit = header($i, "x-awtsmoos-api-key");
  const authHeader = header($i, "authorization");

  let key = explicit;

  if (!key && /^AwtsmoosKey\s+/i.test(authHeader)) {
    key = authHeader.replace(/^AwtsmoosKey\s+/i, "").trim();
  }

  if (!key && /^ApiKey\s+/i.test(authHeader)) {
    key = authHeader.replace(/^ApiKey\s+/i, "").trim();
  }

  if (!key) return null;

  const got = verifyApiKey(key);

  if (!got.ok) {
    return {
      ok: false,
      kind: "apiKey",
      error: got.error || "invalid_api_key"
    };
  }

  return {
    ok: true,
    kind: "apiKey",
    keyId: got.key.keyId,
    userId: got.key.userId,
    scopes: got.key.scopes || []
  };
}

/**
 * B"H
 * Gets OAuth identity.
 *
 * @param {object} $i Route context.
 * @returns {object|null}
 */
function oauthIdentity($i) {
  const authHeader = header($i, "authorization");

  if (!/^Bearer\s+/i.test(authHeader)) {
    return null;
  }

  const got = readBearer($i);

  if (!got.ok) {
    return {
      ok: false,
      kind: "oauth",
      error: got.error || "invalid_oauth_token"
    };
  }

  return {
    ok: true,
    kind: "oauth",
    userId: got.entry.userId,
    clientId: got.entry.clientId,
    scopes: String(got.entry.scope || "").split(/\s+/).filter(Boolean)
  };
}

/**
 * B"H
 * Gets logged-in Awtsmoos user from request.user.
 *
 * @param {object} $i Route context.
 * @returns {object|null}
 */
function sessionIdentity($i) {
  const user = $i.request?.user;
  const userId = user?.info?.userId || user?.userId || user?.id || null;

  if (!userId) return null;

  return {
    ok: true,
    kind: "session",
    userId,
    scopes: ["tunnel.read", "tunnel.write", "tunnel.admin"]
  };
}

/**
 * B"H
 * Main identity resolver.
 *
 * Priority:
 * 1. API key
 * 2. OAuth bearer
 * 3. Browser session
 *
 * This lets the hosted dashboard be logged in while still using a scoped API key
 * for protected filesystem calls.
 *
 * @param {object} $i Route context.
 * @returns {object}
 */
function currentIdentity($i) {
  const apiKey = apiKeyIdentity($i);
  if (apiKey?.ok) return apiKey;

  const oauth = oauthIdentity($i);
  if (oauth?.ok) return oauth;

  const session = sessionIdentity($i);
  if (session?.ok) return session;

  return {
    ok: false,
    error: apiKey?.error || oauth?.error || "not_authenticated"
  };
}

function requireIdentity($i) {
  return currentIdentity($i);
}

module.exports = {
  currentIdentity,
  requireIdentity
};
