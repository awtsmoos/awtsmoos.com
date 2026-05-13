
// B"H

/**
 * @file core/idle/flushSearch.js
 * @chapter The Search Mirror Settles
 * @description
 * Search flushing is isolated so the core DB class stays small.
 */

/**
 * @function flushSearch
 * @description
 * Flushes search manager if present.
 *
 * @param {object} db - AwtsmoosDB instance.
 * @returns {void}
 */
function flushSearch(db) {
  if (db.search && typeof db.search.flush === 'function') {
    db.search.flush();
  }
}

module.exports = flushSearch;
