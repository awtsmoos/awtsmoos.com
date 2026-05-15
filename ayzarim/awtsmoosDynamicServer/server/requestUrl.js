
// B"H

/**
 * B"H
 * Detects the request protocol.
 *
 * @param {object} request Incoming request.
 * @returns {string} Protocol.
 */
function protocolOf(request) {
  return request.connection && request.connection.encrypted ? "https" : "http";
}

/**
 * B"H
 * Builds a safe full URL for mock and real requests.
 *
 * @param {object} request Incoming request.
 * @returns {URL} Full URL.
 */
function fullRequestUrl(request) {
  const protocol = protocolOf(request);
  const host = request.headers && request.headers.host
    ? request.headers.host
    : "localhost";

  return new URL(request.url, `${protocol}://${host}`);
}

/**
 * B"H
 * Decodes a pathname without letting bad escaping crash the server.
 *
 * @param {URL} fullUrl Request URL.
 * @returns {string} Decoded pathname.
 */
function decodedPathname(fullUrl) {
  try {
    return decodeURIComponent(fullUrl.pathname || "/");
  } catch (e) {
    return fullUrl.pathname || "/";
  }
}

module.exports = { fullRequestUrl, decodedPathname };
