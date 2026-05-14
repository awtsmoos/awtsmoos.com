
// B"H

const { readBearer } = require("../../../oauth/core/tokenReader.js");
const { verifyApiKey } = require("./apiKeyStore.js");

/**
 * B"H
 * Gets logged-in Awtsmoos user from request.user.
 *
 * @param {object} $i Route context.
 * @returns {object|null} Identity.
 */
function sessionIdentity($i) {
  const user = $i.request.user;
  const userId =
    user?.info?.userId ||
    user?.userId ||
    user?.id ||
    null;

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
 * Gets OAuth identity.
 *
 * @param {object} $i Route context.
 * @returns {object|null} Identity.
 */
function oauthIdentity($i) {
  const authHeader = $i.request.headers.authorization || "";

  if (!/^Bearer\s+/i.test(authHeader)) {
    return null;
  }

  const got = readBearer($i);

  if (!got.ok) {
    return null;
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
 * Gets API key identity.
 *
 * @param {object} $i Route context.
 * @returns {object|null} Identity.
 */
function apiKeyIdentity($i) {
  const key =
    $i.request.headers["x-awtsmoos-api-key"] ||
    String($i.request.headers.authorization || "").replace(/^AwtsmoosKey\s+/i, "");

  if (!key) return null;

  const got = verifyApiKey(key);

  if (!got.ok) return null;

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
 * Main current identity resolver.
 *
 * @param {object} $i Route context.
 * @returns {object} Identity result.
 */
function currentIdentity($i) {
  return (
    sessionIdentity($i) ||
    oauthIdentity($i) ||
    apiKeyIdentity($i) ||
    { ok: false, error: "not_authenticated" }
  );
}

function requireIdentity($i) {
  const ident = currentIdentity($i);

  if (!ident.ok) {
    return ident;
  }

  return ident;
}

module.exports = {
  currentIdentity,
  requireIdentity
};
