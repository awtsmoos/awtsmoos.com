
// B"H

/**
 * @file test/lightning/cleanDbFiles/cleanTempDir.js
 * @chapter The Hidden Room Is Swept
 * @description
 * Removes the lightning temp folder.
 */

const fs = require('fs');

/**
 * @function cleanTempDir
 * @description Deletes temp directory recursively.
 * @param {string} dir - Directory path.
 * @returns {void}
 */
function cleanTempDir(dir) {
  try {
    fs.rmSync(dir, {
      recursive: true,
      force: true
    });
  } catch (_err) {}
}

module.exports = cleanTempDir;
