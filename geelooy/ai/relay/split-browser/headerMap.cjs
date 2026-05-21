//B"H
const DROP_REQUEST = /^(connection|content-length|transfer-encoding|upgrade|proxy-|alt-used)$/i;
const DROP_RESPONSE = /^(connection|content-length|transfer-encoding|content-encoding|alt-svc)$/i;

/**
 * Chapter 24: The Headers Stopped Preaching And Started Witnessing.
 *
 * The relay should copy the browser's request as faithfully as possible, then
 * alter only the pieces that cannot remain localhost: host, origin, referer,
 * forwarded cookies, and a modern user-agent fallback. Everything else crosses
 * as the browser gave it, including sec-fetch-* and accept-* signals.
 *
 * @param {Record<string,string|string[]>} incoming Local request headers.
 * @param {string} origin Upstream origin.
 * @param {string} cookie Cookie header owned by Node.
 * @returns {Record<string,string|string[]>} Upstream headers.
 */
function upstreamHeaders(incoming, origin, cookie = "") {
  const upstream = {};
  const upstreamUrl = new URL(origin);
  for (const [key, value] of Object.entries(incoming || {})) {
    const lower = key.toLowerCase();
    if (DROP_REQUEST.test(lower)) continue;
    if (lower === "host") continue;
    if (lower === "cookie") continue;
    upstream[lower] = rewriteHeaderValue(lower, value, origin);
  }
  upstream.host = upstreamUrl.host;
  if (cookie) upstream.cookie = cookie;
  if (!upstream["user-agent"]) upstream["user-agent"] = browserUserAgent();
  if (!upstream.accept) upstream.accept = "*/*";
  return upstream;
}

function rewriteHeaderValue(key, value, origin) {
  if (Array.isArray(value)) return value.map(item => rewriteHeaderValue(key, item, origin));
  const text = String(value || "");
  if (key === "origin") return origin;
  if (key === "referer") return text.replace(/^https?:\/\/127\.0\.0\.1:\d+/i, origin).replace(/^http:\/\/localhost:\d+/i, origin);
  return text;
}

/** @param {Headers} headers @param {string} type */
function responseHeaders(headers, type) {
  const kept = { "content-type": type || "application/octet-stream", "cache-control": "no-store" };
  headers.forEach((value, key) => {
    if (DROP_RESPONSE.test(key)) return;
    if (/^content-security-policy/i.test(key)) return;
    if (/^cross-origin-/i.test(key)) return;
    kept[key] = value;
  });
  const cookie = getSetCookie(headers);
  if (cookie.length) kept["set-cookie"] = cookie;
  return kept;
}

function getSetCookie(headers) {
  return headers.getSetCookie ? headers.getSetCookie() : headers.get("set-cookie") ? [headers.get("set-cookie")] : [];
}

function browserUserAgent() {
  return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
}

module.exports = { upstreamHeaders, responseHeaders, getSetCookie };
