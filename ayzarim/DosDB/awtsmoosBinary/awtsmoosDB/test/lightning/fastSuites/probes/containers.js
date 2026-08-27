
// B"H

/**
 * @file test/lightning/fastSuites/probes/containers.js
 * @chapter The Vessels Hold Their Order
 * @description
 * Validates Object insertion order, Map sort order, List indexing, and Set
 * resurrection at lightning scale.
 */

const A = require('../assertions.js');

/**
 * @class ContainerProbe
 * @description
 * Container feature probe.
 */
class ContainerProbe {
  /**
   * @method run
   * @description Runs container checks.
   * @param {object} db - AwtsmoosDB instance.
   * @returns {void}
   */
  run(db) {
    db.root.ordered = new db.Object();
    db.root.ordered.zebra = 1;
    db.root.ordered.apple = 2;
    db.root.ordered.mango = 3;

    db.root.sorted = new db.Map();
    db.root.sorted.zebra = 1;
    db.root.sorted.apple = 2;
    db.root.sorted.mango = 3;

    db.root.list = new db.List();
    db.root.list.push('first');
    db.root.list.push('second');
    db.root.list.push('third');

    db.root.nativeSet = new Set(['aleph', 'beis', 'gimmel']);

    A.deepArray(db.keys(db.root.ordered), ['zebra', 'apple', 'mango'], 'Object order preserved');
    A.deepArray(db.keys(db.root.sorted), ['apple', 'mango', 'zebra'], 'Map order sorted');
    A.equal(db.root.list[1], 'second', 'List index preserved');
    A.truth(db.root.nativeSet instanceof Set, 'Set resurrected');
    A.truth(db.root.nativeSet.has('beis'), 'Set membership preserved');
  }
}

module.exports = ContainerProbe;
