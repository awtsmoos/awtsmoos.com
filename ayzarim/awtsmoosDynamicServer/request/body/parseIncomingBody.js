
// B"H

const {
  isJsonType,
  isUrlEncodedType,
  isMultipartType
} = require("./contentType.js");

const { looksLikeJson } = require("./jsonGuess.js");
const { parseJsonBody } = require("./jsonBody.js");
const { parseUrlEncodedBody } = require("./urlEncodedBody.js");
const { parseMultipartBody } = require("./multipartBody.js");
const { parseRawBody } = require("./rawBody.js");

/**
 * B"H
 * Parses incoming request body data.
 *
 * @param {object} options Parser options.
 * @returns {object|array} Parsed body.
 */
function parseIncomingBody(options) {
  const bodyBuffer = options.bodyBuffer;

  if (!bodyBuffer || bodyBuffer.length === 0) return {};

  if (isMultipartType(options.contentType)) {
    return parseMultipartBody(options);
  }

  if (isUrlEncodedType(options.contentType)) {
    return parseUrlEncodedBody(bodyBuffer, options.querystring);
  }

  if (isJsonType(options.contentType) || looksLikeJson(bodyBuffer)) {
    return parseJsonBody(bodyBuffer);
  }

  return parseRawBody(bodyBuffer);
}

module.exports = { parseIncomingBody };
