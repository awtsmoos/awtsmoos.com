
// B"H

const { readBearer } = require("../../../oauth/core/tokenReader.js");
const { verifyApiKey } = require("./apiKeyStore.js");

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
    scopes: got.key.scopes || [],
    rateLimitPerMinute: got.key.rateLimitPerMinute,
    bytesPerDay: got.key.bytesPerDay
  };
}

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

function sessionIdentity($i) {
  const user = $i.request?.user;
  const userId = user?.info?.userId || user?.userId || user?.id || null;

  if (!userId) return null;

  return {
    ok: true,
    kind: "session",
    userId,
    scopes: ["profile", "tunnel.read", "tunnel.write", "tunnel.admin"]
  };
}

/**
 * B"H
 * Identity priority is important.
 *
 * API key comes first so the hosted dashboard can be logged in while also
 * making protected file / command / Chrome calls through a scoped key.
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
