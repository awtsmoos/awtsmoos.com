
// B"H

/**
 * @file core/idle/drainIndexOps.js
 * @chapter The Small Angels Finish Quietly
 * @description
 * Runs pending index operations without bloating index.js.
 */

/**
 * @function drainIndexOps
 * @description Drains queued index operations.
 * @param {object} db - DB instance.
 * @returns {void}
 */
function drainIndexOps(db) {
  const pending = db._pendingIndexOps || [];
  db._pendingIndexOps = [];

  for (const op of pending) {
    try {
      op();
    } catch (err) {
      if (db.options && db.options.debug) console.error(err);
    }
  }
}

module.exports = drainIndexOps;
