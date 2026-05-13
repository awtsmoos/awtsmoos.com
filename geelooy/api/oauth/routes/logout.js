
// B"H

const { json } = require("../tools/respond.js");

/**
 * B"H
 * Builds cookie-clearing strings for every likely Awtsmoos login-cookie shape.
 *
 * The login ghost can cling to the host-only cookie, the apex domain cookie,
 * or the dot-domain cookie shared across www and non-www. This function does
 * not argue with the ghost. It burns every doorway where it could hide.
 *
 * @param {string} host Current request host, possibly including a port.
 * @returns {Array<string>} Set-Cookie header values that expire awtsmoosKey.
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
 * Clears the Awtsmoos login cookie used by server-side session middleware.
 *
 * If the main logout button only clears frontend state, this route clears the
 * actual awtsmoosKey cookie that the dynamic server uses to populate request.user.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} JSON logout result.
 */
async function logout($i) {
  const host = $i.request.headers.host || "awtsmoos.com";

  $i.response.setHeader("Set-Cookie", expiredAwtsmoosCookies(host));

  return json($i, {
    BH: "B\"H",
    ok: true,
    message: "awtsmoosKey cookie cleared for this OAuth domain. Now refresh /api/oauth/authorize.",
    host,
    testAuthorizeUrl: "https://" + host + "/api/oauth/authorize?client_id=chatgpt&response_type=code&redirect_uri=https%3A%2F%2Fchatgpt.com&scope=profile%20tunnel.read"
  });
}

module.exports = { logout, expiredAwtsmoosCookies };
