
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
 * This lets PowerShell, Bash, and the Node local control app live as their
 * own real files. No giant shell script inside JavaScript strings. No quote
 * wars. No backtick explosions.
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
