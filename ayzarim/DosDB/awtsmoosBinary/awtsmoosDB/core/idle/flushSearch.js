
// B"H

/**
 * @file core/idle/flushSearch.js
 * @chapter The Search Mirror Settles
 * @description
 * Search manager flushing is isolated here.
 */

/**
 * @function flushSearch
 * @description Flushes search manager if present.
 * @param {object} db - DB instance.
 * @returns {void}
 */
function flushSearch(db) {
  if (db.search && typeof db.search.flush === 'function') {
    db.search.flush();
  }
}

module.exports = flushSearch;
