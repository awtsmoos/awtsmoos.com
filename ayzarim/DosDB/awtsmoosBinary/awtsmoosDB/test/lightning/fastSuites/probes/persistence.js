
// B"H

/**
 * @file test/lightning/fastSuites/probes/persistence.js
 * @chapter The World Closes And Returns
 * @description
 * Compact persistence check. It forces one reopen, not thousands of mutations.
 */

const A = require('../assertions.js');

/**
 * @class PersistenceProbe
 * @description
 * Reopen validation probe.
 */
class PersistenceProbe {
  /**
   * @method write
   * @description Writes values before reopen.
   * @param {object} db - DB instance.
   * @returns {void}
   */
  write(db) {
    db.root.persisted = {
      word: 'chai',
      huge: 987654321987654321n,
      inner: {
        alive: true
      }
    };
  }

  /**
   * @method read
   * @description Reads values after reopen.
   * @param {object} db - DB instance.
   * @returns {void}
   */
  read(db) {
    A.equal(db.root.persisted.word, 'chai', 'persisted string survived');
    A.equal(db.root.persisted.huge, 987654321987654321n, 'persisted BigInt survived');
    A.equal(db.root.persisted.inner.alive, true, 'persisted nested boolean survived');
  }
}

module.exports = PersistenceProbe;
