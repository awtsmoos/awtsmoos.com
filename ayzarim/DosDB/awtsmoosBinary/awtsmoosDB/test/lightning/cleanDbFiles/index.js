
// B"H

/**
 * @file test/lightning/cleanDbFiles/index.js
 * @chapter The Fast Sweeper
 * @description
 * Deletes DB files before and after every test without walking the whole repo.
 */

const paths = require('./paths.js');
const cleanDir = require('./cleanDir.js');
const cleanTempDir = require('./cleanTempDir.js');

/**
 * @function cleanDbFiles
 * @description Cleans known DB artifact folders.
 * @returns {void}
 */
function cleanDbFiles() {
  cleanDir(paths.TEST_DIR);
  cleanDir(paths.ROOT);
  cleanTempDir(paths.LIGHTNING_TMP);
}

module.exports = cleanDbFiles;
