
// B"H

/**
 * B"H
 * Extracts multipart boundary.
 *
 * @param {string} contentType Content-type header.
 * @returns {string} Boundary.
 */
function getBoundary(contentType) {
  const match = String(contentType || "").match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? (match[1] || match[2] || "").trim() : "";
}

/**
 * B"H
 * Parses multipart data through the existing parser.
 *
 * @param {object} options Parser options.
 * @returns {object} Parsed body.
 */
function parseMultipartBody(options) {
  const boundary = getBoundary(options.contentType);

  if (!boundary) {
    return {
      __raw_body__: options.bodyBuffer,
      __body_parse_error__: "Missing multipart boundary."
    };
  }

  return options.parseMultipartFormData(options.bodyBuffer, boundary);
}

module.exports = { parseMultipartBody, getBoundary };
