
// B"H

const crypto = require("crypto");
const { secretString } = require("./serverSecret.js");

function verifyAwtsmoosOAuthToken(token, secret) {
  const parts = String(token || "").split(".");

  if (parts.length !== 3 || parts[0] !== "B\"H") {
    return {
      ok: false,
      error: "bad_token_shape"
    };
  }

  const payload = parts[0] + "." + parts[1];
  const sig = parts[2];

  const expected = crypto
    .createHmac("sha256", String(secret))
    .update(payload)
    .digest("hex");

  if (sig !== expected) {
    return {
      ok: false,
      error: "bad_signature"
    };
  }

  let decoded;

  try {
    decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch (e) {
    return {
      ok: false,
      error: "bad_payload",
      details: e.message
    };
  }

  const entry = decoded.entry || decoded;

  if (!entry || entry.kind !== "oauth_access") {
    return {
      ok: false,
      error: "wrong_token_kind"
    };
  }

  const issuedAt = Number(decoded.zman || entry.createdAt || 0);
  const expiresIn = Number(decoded.hoshufuh?.expiresIn || 3600);

  if (issuedAt && Date.now() > issuedAt + expiresIn * 1000) {
    return {
      ok: false,
      error: "token_expired"
    };
  }

  return {
    ok: true,
    raw: decoded,
    entry
  };
}

/**
 * B"H
 * Reads an OAuth bearer token.
 *
 * This no longer depends on $i.sodos or $i.self.secret existing.
 * It uses the same secret resolver as token.js.
 */
function readBearer($i) {
  const auth = $i.request?.headers?.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return {
      ok: false,
      error: "missing_bearer_token"
    };
  }

  const got = verifyAwtsmoosOAuthToken(token, secretString($i));

  if (!got.ok) {
    return {
      ok: false,
      error: "invalid_token",
      details: got.error,
      more: got.details || null
    };
  }

  return {
    ok: true,
    token,
    raw: got.raw,
    entry: got.entry
  };
}

module.exports = {
  readBearer,
  verifyAwtsmoosOAuthToken
};
