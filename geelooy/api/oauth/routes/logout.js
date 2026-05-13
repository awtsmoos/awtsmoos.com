// B"H

const { json } = require("../tools/respond.js");

/**
 * B"H
 * Clears the Awtsmoos login cookie used by the server session middleware.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON response.
 */
async function logout($i) {
  $i.response.setHeader(
    "Set-Cookie",
    [
      "awtsmoosKey=;",
      "HttpOnly",
      "Path=/",
      "Max-Age=0",
      "SameSite=Lax"
    ].join("; ")
  );

  return json($i, {
    BH: "B\"H",
    ok: true,
    message: "awtsmoosKey cookie cleared. Refresh /api/oauth/authorize to test logged-out flow."
  });
}

module.exports = { logout };