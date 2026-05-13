
// B"H

/**
 * B"H
 * Reads an OAuth bearer token.
 * This expects your existing sodos token validator to be available.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Auth result.
 */
function readBearer($i) {
  const auth = $i.request.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();

  if (!token) return { ok: false, error: "missing_bearer_token" };

  try {
    const raw = $i.sodos.validateToken(token, $i.self.secret);
    const decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    const entry = decoded.entry || decoded;

    if (!entry || entry.kind !== "oauth_access") {
      return { ok: false, error: "wrong_token_kind" };
    }

    return { ok: true, token, raw: decoded, entry };
  } catch (e) {
    return { ok: false, error: "invalid_token", details: e.message };
  }
}

module.exports = { readBearer };
