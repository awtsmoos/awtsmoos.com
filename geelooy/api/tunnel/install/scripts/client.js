
// B"H

const { readTunnelDownload } = require("../tools/sourceFile.js");

/**
 * B"H
 * Returns the Awtsmoos tunnel client as raw JavaScript text.
 *
 * The client contains normal JavaScript code and may include strings that would
 * be dangerous to embed inside another JavaScript template literal. Serving
 * the file directly keeps the client clean and easier to edit.
 *
 * @returns {string} Node.js tunnel client source.
 */
function tunnelClient() {
  return readTunnelDownload("awtsmoos-tunnel-client.js");
}

module.exports = { tunnelClient };
