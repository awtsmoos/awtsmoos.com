
// B"H

const { readTunnelDownload } = require("../tools/sourceFile.js");

/**
 * B"H
 * Returns the Windows PowerShell installer as raw text.
 *
 * The first broken version embedded PowerShell inside a JavaScript template
 * literal. PowerShell uses the backtick character, and JavaScript template
 * literals also use that character. That made the JS module tear open before
 * the route could even load.
 *
 * This version serves the actual .ps1 file from apps/tunnel/downloads, so the
 * script can contain normal PowerShell without fighting JavaScript parsing.
 *
 * @returns {string} PowerShell installer script.
 */
function windowsInstaller() {
  return readTunnelDownload("windows.ps1");
}

module.exports = { windowsInstaller };
