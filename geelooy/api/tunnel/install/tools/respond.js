
// B"H

/**
 * B"H
 * Sends plain text through the Awtsmoos dynamic response system.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} text Text body to return.
 * @param {string} mimeType Content-Type header value.
 * @returns {object} Dynamic response packet.
 */
function sendText($i, text, mimeType) {
  $i.response.statusCode = 200;
  $i.response.setHeader("Content-Type", mimeType || "text/plain; charset=utf-8");

  return {
    mimeType: mimeType || "text/plain",
    response: text
  };
}

module.exports = { sendText };
