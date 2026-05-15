
// B"H

/**
 * B"H
 * Applies the normal Awtsmoos response headers.
 *
 * @param {object} response Outgoing response.
 * @returns {void}
 */
function applyBaseHeaders(response) {
  response.setHeader("BH", "Boruch Hashem");
  response.setHeader("Awtsmoos", "Is found in all things");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("content-language", "en");
}

module.exports = { applyBaseHeaders };
