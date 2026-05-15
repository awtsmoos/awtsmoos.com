
// B"H

/**
 * @file test/lightning/cleanDbFiles/cleanDir.js
 * @chapter The Broom In One Room
 * @description
 * Cleans one folder only. Fast, strict, enough for these tests.
 * Removes both DB artifact files and lock-reader artifact directories.
 */

const fs = require('fs');
const path = require('path');
const isArtifact = require('./isArtifact.js');

/**
 * @function cleanDir
 * @description Deletes DB artifacts inside one directory.
 * @param {string} dir - Directory.
 * @returns {void}
 */
function cleanDir(dir) {
  let items;

  try {
    items = fs.readdirSync(dir, {
      withFileTypes: true
    });
  } catch (_err) {
    return;
  }

  for (const item of items) {
    if (!item.isFile() && !item.isDirectory()) continue;
    if (!isArtifact(item.name)) continue;

    try {
      fs.rmSync(path.join(dir, item.name), {
        force: true,
        recursive: item.isDirectory()
      });
    } catch (_err) {}
  }
}

module.exports = cleanDir;
