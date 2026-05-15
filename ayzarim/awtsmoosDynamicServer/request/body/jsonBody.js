
// B"H

const { safeJson } = require("./safeJson.js");

/**
 * B"H
 * Parses application/json body data.
 *
 * @param {Buffer} bodyBuffer Raw body.
 * @returns {object|array} Parsed JSON or error wrapper.
 */
function parseJsonBody(bodyBuffer) {
  const parsed = safeJson(bodyBuffer, null);

  if (parsed && typeof parsed === "object") {
    return parsed;
  }

  return {
    __raw_body__: bodyBuffer,
    __body_parse_error__: "Invalid JSON body."
  };
}

module.exports = { parseJsonBody };
