
// B"H

const { json } = require("../tools/respond.js");

/**
 * B"H
 * Builds expired Set-Cookie strings for the Awtsmoos login cookie.
 *
 * It clears host-only, apex-domain, dot-domain, and current-host shapes.
 *
 * @param {string} host Current request host.
 * @returns {Array<string>} Set-Cookie header strings.
 */
function expiredAwtsmoosCookies(host) {
  const cleanHost = String(host || "awtsmoos.com").split(":")[0];

  const base = [
    "awtsmoosKey=",
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "SameSite=Lax"
  ];

  const cookies = [
    base.join("; "),
    [...base, "Domain=awtsmoos.com"].join("; "),
    [...base, "Domain=.awtsmoos.com"].join("; ")
  ];

  if (cleanHost && cleanHost !== "awtsmoos.com") {
    cookies.push([...base, "Domain=" + cleanHost].join("; "));
  }

  return cookies;
}

/**
 * B"H
 * Clears the Awtsmoos login cookie for OAuth testing.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON logout response.
 */
async function logout($i) {
  const host = $i.request.headers.host || "awtsmoos.com";

  $i.response.setHeader("Set-Cookie", expiredAwtsmoosCookies(host));

  return json($i, {
    BH: "B\"H",
    ok: true,
    message: "awtsmoosKey cookie cleared for this OAuth host. Now refresh authorize.",
    host,
    testAuthorizeUrl:
      "https://" +
      host +
      "/api/oauth/authorize?client_id=chatgpt&response_type=code&redirect_uri=https%3A%2F%2Fchatgpt.com&scope=profile%20tunnel.read"
  });
}

module.exports = { logout, expiredAwtsmoosCookies };
