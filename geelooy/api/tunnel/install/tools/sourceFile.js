
// B"H

const fs = require("fs");
const path = require("path");

/**
 * B"H
 * Resolves the repo's geelooy folder from this installer endpoint.
 *
 * This module lives at:
 * geelooy/api/tunnel/install/tools/sourceFile.js
 *
 * Going upward reaches:
 * tools -> install -> tunnel -> api -> geelooy
 *
 * @returns {string} Absolute path to geelooy folder.
 */
function geelooyRoot() {
  return path.resolve(__dirname, "../../../..");
}

/**
 * B"H
 * Reads a public tunnel download file from geelooy/apps/tunnel/downloads.
 *
 * The installer endpoint should not embed PowerShell, Bash, or client JS inside
 * JavaScript template literals. Those scripts are their own vessels. This
 * reader simply opens them and serves them raw, preserving every quote,
 * backslash, newline, and shell-specific spark exactly as written.
 *
 * @param {string} fileName File name inside geelooy/apps/tunnel/downloads.
 * @returns {string} UTF-8 file text.
 */
function readTunnelDownload(fileName) {
  const full = path.join(
    geelooyRoot(),
    "apps",
    "tunnel",
    "downloads",
    fileName
  );

  return fs.readFileSync(full, "utf8");
}

module.exports = {
  geelooyRoot,
  readTunnelDownload
};
