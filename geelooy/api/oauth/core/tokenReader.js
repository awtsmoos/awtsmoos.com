
// B"H

/**
 * B"H
 * Tries to decode the server's token validator response.
 *
 * Different sodos versions may return base64 JSON or plain object data.
 *
 * @param {*} raw Raw validator result.
 * @returns {object} Decoded token object.
 */
function decodeTokenResult(raw) {
  if (!raw) throw new Error("empty_token_validation_result");

  if (typeof raw === "object") return raw;

  const txt = String(raw);

  try {
    return JSON.parse(txt);
  } catch (e) {}

  return JSON.parse(Buffer.from(txt, "base64").toString("utf8"));
}

/**
 * B"H
 * Reads an OAuth bearer token from Authorization header.
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
    const decoded = decodeTokenResult(raw);
    const entry = decoded.entry || decoded;

    if (!entry || entry.kind !== "oauth_access") {
      return { ok: false, error: "wrong_token_kind" };
    }

    return { ok: true, token, raw: decoded, entry };
  } catch (e) {
    return { ok: false, error: "invalid_token", details: e.message };
  }
}

module.exports = { readBearer, decodeTokenResult };
