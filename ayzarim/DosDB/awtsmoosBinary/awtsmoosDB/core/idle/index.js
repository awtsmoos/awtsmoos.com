
// B"H

/**
 * @file core/idle/index.js
 * @chapter The Stillness Engine
 * @description
 * One clean idle pipeline:
 * superblock, pending index ops, search flush, optional forced fsync.
 */

const shouldSkipForcedFsync = require('./fastGate.js');
const drainIndexOps = require('./drainIndexOps.js');
const flushSearch = require('./flushSearch.js');

/**
 * @function waitForIdle
 * @description
 * Brings the DB to a stable synchronous boundary.
 *
 * @param {object} db - AwtsmoosDB instance.
 * @param {object} [options={}] - Idle options.
 * @returns {void}
 */
function waitForIdle(db, options = {}) {
  db._flushSuperblock();
  drainIndexOps(db);
  flushSearch(db);

  if (!shouldSkipForcedFsync(options)) {
    db.pager.fsync(true);
  }
}

module.exports = waitForIdle;
