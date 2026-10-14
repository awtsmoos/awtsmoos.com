
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
  // B"H: never clobber an error status a publisher set before calling.
  // publishDescriptor sets 500 on build failure; forcing 200 here made
  // curl -fsSL download an error JSON as if it were a valid descriptor.
  const current = $i.response.statusCode;
  if (!current || current === 200) {
    $i.response.statusCode = 200;
  }
  $i.response.setHeader("Content-Type", mimeType || "text/plain; charset=utf-8");

  return {
    mimeType: mimeType || "text/plain",
    response: text
  };
}

module.exports = { sendText };
