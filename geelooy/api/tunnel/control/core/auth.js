
// B"H

const { readBearer } = require("../../../oauth/core/tokenReader.js");
const { verifyApiKey } = require("./apiKeyStore.js");

function query($i) {
  return $i.paramKinds?.GET || $i.$_GET || $i.request?.query || {};
}

function sessionIdentity($i) {
  const user = $i.request.user;
  const userId = user?.info?.userId || user?.userId || user?.id || null;

  if (!userId) return null;

  return {
    ok: true,
    kind: "session",
    userId,
    scopes: ["tunnel.read", "tunnel.write", "tunnel.admin"]
  };
}

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

function apiKeyIdentity($i) {
  const q = query($i);

  const key =
    q.apiKey ||
    q.api_key ||
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

function currentIdentity($i) {
  return (
    oauthIdentity($i) ||
    apiKeyIdentity($i) ||
    sessionIdentity($i) ||
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
