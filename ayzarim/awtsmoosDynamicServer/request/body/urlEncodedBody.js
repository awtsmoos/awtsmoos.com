
// B"H

const { safeJson } = require("./safeJson.js");

/**
 * B"H
 * Parses URL encoded form data.
 *
 * @param {Buffer} bodyBuffer Raw body.
 * @param {object} querystring Node querystring module.
 * @returns {object} Parsed body.
 */
function parseUrlEncodedBody(bodyBuffer, querystring) {
  const text = bodyBuffer.toString("utf8");
  const parsed = querystring.parse(text);

  for (const key of Object.keys(parsed)) {
    const json = safeJson(parsed[key], undefined);
    if (json !== undefined) parsed[key] = json;
  }

  return parsed;
}

module.exports = { parseUrlEncodedBody };
