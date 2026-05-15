
// B"H

/**
 * @file test/lightning/cleanDbFiles/suffixes.js
 * @chapter The Ashes Marked For Sweeping
 * @description
 * Database artifact suffix list.
 * Includes process lock files/directories so stale test locks cannot poison later runs.
 */

module.exports = [
  '.db',
  '.db-wal',
  '.db-shm',
  '.wal',
  '.shm',
  '.lock',
  '.readers',
  '.turbo.json',
  '.turbo.log',
  '.turbo.tree.json',
  '.turbo.tree.json.tmp'
];
