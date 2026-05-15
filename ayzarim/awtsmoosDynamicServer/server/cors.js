
// B"H

/**
 * B"H
 * Applies cross-origin headers used by the dynamic server.
 *
 * @param {object} request Incoming request.
 * @param {object} response Outgoing response.
 * @returns {void}
 */
function applyCors(request, response) {
  const origin = request.headers.origin;

  response.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, DELETE"
  );

  response.setHeader(
    "Access-Control-Allow-Headers",
    "content-type, authorization, x-awtsmoos-api-key, awtsmoos-file-status"
  );

  response.setHeader("Access-Control-Allow-Origin", origin || "*");
  response.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  response.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  response.setHeader("cross-origin-resource-policy", "cross-origin");
}

/**
 * B"H
 * Ends OPTIONS preflight requests.
 *
 * @param {object} request Incoming request.
 * @param {object} response Outgoing response.
 * @returns {boolean} Whether the request was ended.
 */
function handleOptions(request, response) {
  if (request.method !== "OPTIONS") return false;

  response.writeHead(204);
  response.end();
  return true;
}

module.exports = { applyCors, handleOptions };
