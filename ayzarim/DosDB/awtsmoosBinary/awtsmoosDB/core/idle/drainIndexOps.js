
// B"H

/**
 * @file core/idle/drainIndexOps.js
 * @chapter The Quiet Angels Finish Their Work
 * @description
 * Pending index updates are drained here so index.js does not become a giant
 * tangled palace. Errors only log in debug mode.
 */

/**
 * @function drainIndexOps
 * @description
 * Runs and clears pending index operations.
 *
 * @param {object} db - AwtsmoosDB instance.
 * @returns {void}
 */
function drainIndexOps(db) {
  const list = db._pendingIndexOps;
  db._pendingIndexOps = [];

  for (const op of list) {
    try {
      op();
    } catch (err) {
      if (db.options && db.options.debug) {
        console.error(err);
      }
    }
  }
}

module.exports = drainIndexOps;
