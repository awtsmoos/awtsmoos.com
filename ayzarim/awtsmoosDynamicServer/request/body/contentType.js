
// B"H

/**
 * B"H
 * Normalizes a content-type header.
 *
 * @param {string} value Raw content-type.
 * @returns {string} Lowercase media type.
 */
function mediaType(value) {
  return String(value || "").split(";")[0].trim().toLowerCase();
}

/**
 * B"H
 * Detects JSON-ish content types.
 *
 * @param {string} value Raw content-type.
 * @returns {boolean} Whether content-type is JSON.
 */
function isJsonType(value) {
  const type = mediaType(value);
  return type === "application/json" || type.endsWith("+json");
}

/**
 * B"H
 * Detects urlencoded form type.
 *
 * @param {string} value Raw content-type.
 * @returns {boolean} Whether content-type is urlencoded.
 */
function isUrlEncodedType(value) {
  return mediaType(value) === "application/x-www-form-urlencoded";
}

/**
 * B"H
 * Detects multipart form type.
 *
 * @param {string} value Raw content-type.
 * @returns {boolean} Whether content-type is multipart.
 */
function isMultipartType(value) {
  return mediaType(value) === "multipart/form-data";
}

module.exports = { mediaType, isJsonType, isUrlEncodedType, isMultipartType };
