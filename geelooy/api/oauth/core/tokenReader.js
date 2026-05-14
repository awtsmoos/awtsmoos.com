
// B"H

const { resolveServerSecret } = require("./serverSecret.js");
const {
  decodeTokenValidationResult,
  getTokenEntry,
  isTokenExpired
} = require("./tokenDecoder.js");

/**
 * B"H
 * Extracts a bearer token from the Authorization header.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {string} Bearer token or empty string.
 */
function getBearerToken($i) {
  const auth = $i.request.headers.authorization || "";
  return auth.replace(/^Bearer\s+/i, "").trim();
}

/**
 * B"H
 * Validates a token using the best available route.
 *
 * First it tries a future injected helper named validateToken.
 * If that does not exist, it reconstructs the server secret and calls sodos directly.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} token Bearer token.
 * @returns {object} Validation result.
 */
function validateOAuthToken($i, token) {
  if (typeof $i.validateToken === "function") {
    const viaHelper = $i.validateToken(token);

    if (viaHelper && viaHelper.success) {
      return {
        ok: true,
        decoded: viaHelper.success,
        source: "$i.validateToken"
      };
    }

    return {
      ok: false,
      error: viaHelper?.error || "validateToken_helper_rejected_token"
    };
  }

  const secret = resolveServerSecret($i);

  if (!secret.ok) {
    return {
      ok: false,
      error: "could_not_resolve_server_secret",
      details: secret.error
    };
  }

  const raw = $i.sodos.validateToken(token, secret.secret);

  if (!raw) {
    return {
      ok: false,
      error: "sodos_rejected_token",
      source: secret.source
    };
  }

  return {
    ok: true,
    decoded: decodeTokenValidationResult(raw),
    source: secret.source
  };
}

/**
 * B"H
 * Reads and validates an OAuth access bearer token.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Auth result.
 */
function readBearer($i) {
  const token = getBearerToken($i);

  if (!token) {
    return {
      ok: false,
      error: "missing_bearer_token"
    };
  }

  try {
    const valid = validateOAuthToken($i, token);

    if (!valid.ok) {
      return {
        ok: false,
        error: "invalid_token",
        details: valid.details || valid.error
      };
    }

    const decoded = valid.decoded;
    const entry = getTokenEntry(decoded);

    if (!entry || entry.kind !== "oauth_access") {
      return {
        ok: false,
        error: "wrong_token_kind"
      };
    }

    if (isTokenExpired(decoded)) {
      return {
        ok: false,
        error: "token_expired"
      };
    }

    return {
      ok: true,
      token,
      raw: decoded,
      entry,
      source: valid.source
    };
  } catch (e) {
    return {
      ok: false,
      error: "invalid_token",
      details: e.stack || e.message
    };
  }
}

module.exports = {
  readBearer,
  getBearerToken,
  validateOAuthToken
};
