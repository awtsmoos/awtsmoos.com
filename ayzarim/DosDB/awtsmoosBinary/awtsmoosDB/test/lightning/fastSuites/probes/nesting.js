
// B"H

/**
 * @file test/lightning/fastSuites/probes/nesting.js
 * @chapter The Small Abyss
 * @description
 * Replaces enormous abyss tests with a compact nested chain.
 */

const A = require('../assertions.js');

/**
 * @class NestingProbe
 * @description
 * Nested object probe.
 */
class NestingProbe {
  /**
   * @method run
   * @description Builds and checks nested levels.
   * @param {object} db - AwtsmoosDB instance.
   * @returns {void}
   */
  run(db) {
    db.root.abyss = {};
    let cur = db.root.abyss;

    for (let i = 0; i < 12; i++) {
      cur[`level_${i}`] = {
        id: i
      };
      cur = cur[`level_${i}`];
    }

    let read = db.root.abyss;

    for (let i = 0; i < 12; i++) {
      read = read[`level_${i}`];
      A.equal(read.id, i, `nested level ${i} preserved`);
    }
  }
}

module.exports = NestingProbe;
