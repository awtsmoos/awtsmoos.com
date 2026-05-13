
// B"H

/**
 * @file test/lightning/cleanDbFiles.js
 * @chapter The Sweeper After Every World
 * @description
 * Deletes database artifacts before and after every test.
 */

const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.idea',
  '.vscode'
]);

const DB_SUFFIXES = [
  '.db',
  '.db-wal',
  '.db-shm',
  '.wal',
  '.shm'
];

/**
 * @function isDbArtifact
 * @description
 * Checks whether a path is a database artifact that should be deleted.
 *
 * @param {string} filePath - File path.
 * @returns {boolean} True when file should be deleted.
 */
function isDbArtifact(filePath) {
  return DB_SUFFIXES.some(suffix => filePath.endsWith(suffix));
}

/**
 * @function walk
 * @description
 * Recursively walks folders and deletes DB artifacts.
 *
 * @param {string} dir - Directory to scan.
 * @returns {void}
 */
function walk(dir) {
  let items;

  try {
    items = fs.readdirSync(dir, {
      withFileTypes: true
    });
  } catch (_err) {
    return;
  }

  for (const item of items) {
    const full = path.join(dir, item.name);

    if (item.isDirectory()) {
      if (!SKIP_DIRS.has(item.name)) walk(full);
      continue;
    }

    if (!item.isFile() || !isDbArtifact(full)) continue;

    try {
      fs.rmSync(full, {
        force: true
      });
    } catch (_err) {}
  }
}

/**
 * @function cleanDbFiles
 * @description
 * Deletes all DB artifacts under the awtsmoosDB folder.
 *
 * @returns {void}
 */
function cleanDbFiles() {
  walk(path.join(__dirname, '..', '..'));
}

module.exports = cleanDbFiles;
