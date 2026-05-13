
// B"H

/**
 * B"H
 * Returns the current full URL.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {string} Current URL.
 */
function currentFullUrl($i) {
  const host = $i.request.headers.host || "awtsmoos.com";
  return "https://" + host + $i.request.url;
}

/**
 * B"H
 * Builds a full URL for this host.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} pathname URL pathname.
 * @param {object} params Query params.
 * @returns {string} Full URL.
 */
function fullUrlFor($i, pathname, params = {}) {
  const host = $i.request.headers.host || "awtsmoos.com";
  return urlWithParams("https://" + host + pathname, params);
}

/**
 * B"H
 * Adds query params to a URL.
 *
 * @param {string} base Base URL.
 * @param {object} params Query params.
 * @returns {string} URL with params.
 */
function urlWithParams(base, params = {}) {
  const u = new URL(base);

  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v) !== "") {
      u.searchParams.set(k, String(v));
    }
  }

  return u.toString();
}

module.exports = { currentFullUrl, fullUrlFor, urlWithParams };
