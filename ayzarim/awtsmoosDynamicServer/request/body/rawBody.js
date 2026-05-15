
// B"H

/**
 * B"H
 * Preserves unknown body formats.
 *
 * @param {Buffer} bodyBuffer Raw body.
 * @returns {object} Raw body wrapper.
 */
function parseRawBody(bodyBuffer) {
  return {
    __raw_body__: bodyBuffer
  };
}

module.exports = { parseRawBody };
