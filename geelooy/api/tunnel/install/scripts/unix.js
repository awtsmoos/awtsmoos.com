
// B"H

const { readTunnelDownload } = require("../tools/sourceFile.js");

/**
 * B"H
 * Returns the Unix/macOS installer as raw text.
 *
 * Bash should live as Bash, not inside a fragile JavaScript string. This keeps
 * quoting, newlines, and shell syntax intact.
 *
 * @returns {string} Bash installer script.
 */
function unixInstaller() {
  return readTunnelDownload("unix.sh");
}

module.exports = { unixInstaller };
