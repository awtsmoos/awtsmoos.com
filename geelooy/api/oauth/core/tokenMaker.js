
// B"H

/**
 * B"H
 * Creates an Awtsmoos access token using the server's existing token maker.
 * The server already knows how to seal speech into a sign;
 * this wraps the payload with OAuth purpose.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {object} payload Token payload.
 * @param {number} seconds Expiration seconds.
 * @returns {object} Token result.
 */
function createAccessToken($i, payload, seconds) {
  try {
    const made = $i.makeToken(payload, { expiresIn: seconds });

    if (!made || !made.success) {
      return { ok: false, error: made?.error || "makeToken_failed" };
    }

    return { ok: true, accessToken: made.success };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { createAccessToken };
