
// B"H

/**
 * @file core/idle/index.js
 * @chapter The Still Point Of The Engine
 * @description
 * Central idle pipeline: superblock, index ops, search, optional fsync.
 */

const shouldSkipForcedFsync = require('./fastGate.js');
const drainIndexOps = require('./drainIndexOps.js');
const flushSearch = require('./flushSearch.js');

/**
 * @function waitForIdle
 * @description Performs DB idle boundary work.
 * @param {object} db - DB instance.
 * @param {object} [options={}] - Idle options.
 * @returns {void}
 */
function waitForIdle(db, options = {}) {
  if (db.turbo && typeof db.turbo.flush === 'function') db.turbo.flush();
  db._flushSuperblock();
  drainIndexOps(db);
  flushSearch(db);

  if (!shouldSkipForcedFsync(options)) {
    db.pager.fsync(true);
  }
}

module.exports = waitForIdle;
