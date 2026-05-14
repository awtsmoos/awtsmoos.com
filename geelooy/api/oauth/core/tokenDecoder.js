
// B"H

/**
 * B"H
 * Decodes the successful return value from sodos.validateToken.
 *
 * sodos.validateToken returns the base64 JSON payload when valid.
 * This function opens that sealed middle chamber and returns the parsed object.
 *
 * @param {*} raw Raw validator result.
 * @returns {object} Decoded token data.
 */
function decodeTokenValidationResult(raw) {
  if (!raw) {
    throw new Error("empty_token_validation_result");
  }

  if (typeof raw === "object") {
    return raw;
  }

  const text = String(raw);

  try {
    return JSON.parse(text);
  } catch (e) {}

  return JSON.parse(Buffer.from(text, "base64").toString("utf8"));
}

/**
 * B"H
 * Reads the token payload entry.
 *
 * @param {object} decoded Decoded token wrapper.
 * @returns {object} Token entry payload.
 */
function getTokenEntry(decoded) {
  return decoded.entry || decoded;
}

/**
 * B"H
 * Checks expiration data inside the existing Awtsmoos token wrapper.
 *
 * @param {object} decoded Decoded token wrapper.
 * @returns {boolean} True if expired.
 */
function isTokenExpired(decoded) {
  const madeAt = decoded.zman || decoded.entry?.createdAt || 0;
  const extra = decoded.hosuhfuh || {};
  const expiresIn = extra.expiresIn || extra.expires_in || 0;

  if (!madeAt || !expiresIn) {
    return false;
  }

  return Date.now() > madeAt + expiresIn * 1000;
}

module.exports = {
  decodeTokenValidationResult,
  getTokenEntry,
  isTokenExpired
};
