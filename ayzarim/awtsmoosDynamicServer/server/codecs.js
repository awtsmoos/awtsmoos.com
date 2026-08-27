
// B"H

/**
 * B"H
 * Encodes base64.
 *
 * @param {string|Buffer} input Input.
 * @returns {string} Base64 string.
 */
function btoa(input) {
  return Buffer.from(input).toString("base64");
}

/**
 * B"H
 * Decodes base64 as binary text.
 *
 * @param {string} input Base64 input.
 * @returns {string} Binary string.
 */
function atob(input) {
  return Buffer.from(input, "base64").toString("binary");
}

module.exports = { btoa, atob };
