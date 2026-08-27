
// B"H

/**
 * B"H
 * Guesses JSON when content-type is missing or wrong.
 *
 * @param {Buffer} bodyBuffer Raw body.
 * @returns {boolean} Whether body looks like JSON.
 */
function looksLikeJson(bodyBuffer) {
  if (!bodyBuffer || !bodyBuffer.length) return false;

  const text = bodyBuffer.toString("utf8").trim();
  return text.startsWith("{") || text.startsWith("[");
}

module.exports = { looksLikeJson };
