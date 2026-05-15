
// B"H

const { applyCors, handleOptions } = require("./cors.js");
const { applyBaseHeaders } = require("./baseHeaders.js");
const { fullRequestUrl, decodedPathname } = require("./requestUrl.js");
const { parseGetParams } = require("./getParams.js");
const { guardResponseEnd } = require("./responseGuard.js");

/**
 * B"H
 * Performs the universal beginning of every request.
 *
 * @param {object} options Bootstrap options.
 * @returns {object|null} Request state or null if ended.
 */
function bootstrapRequest(options) {
  applyCors(options.request, options.response);

  if (handleOptions(options.request, options.response)) {
    return null;
  }

  options.response.statusCode = 200;
  options.request.cookies = options.cookies;

  const fullUrl = fullRequestUrl(options.request);
  const originalPath = decodedPathname(fullUrl);
  const paramKinds = { POST: {}, PUT: {}, GET: {}, DELETE: {} };

  paramKinds.GET = parseGetParams(fullUrl);

  applyBaseHeaders(options.response);
  guardResponseEnd(options.response);

  return {
    fullUrl,
    originalPath,
    paramKinds
  };
}

module.exports = { bootstrapRequest };
