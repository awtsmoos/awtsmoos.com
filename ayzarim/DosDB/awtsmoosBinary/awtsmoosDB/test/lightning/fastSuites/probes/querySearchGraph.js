
// B"H

/**
 * @file test/lightning/fastSuites/probes/querySearchGraph.js
 * @chapter The Higher Senses Blink Awake
 * @description
 * Safely touches higher APIs when present without creating giant graphs.
 */

const A = require('../assertions.js');

/**
 * @class QuerySearchGraphProbe
 * @description
 * Higher API smoke probe.
 */
class QuerySearchGraphProbe {
  /**
   * @method run
   * @description Runs tiny API checks.
   * @param {object} db - AwtsmoosDB instance.
   * @returns {void}
   */
  run(db) {
    db.root.posts = new db.List();
    db.root.posts.push({
      id: 'p1',
      title: 'Motor neuron light',
      tags: ['mind', 'signal']
    });
    db.root.posts.push({
      id: 'p2',
      title: 'Garden circuit',
      tags: ['earth', 'signal']
    });

    A.equal(db.root.posts[0].id, 'p1', 'post list item preserved');

    if (db.search && typeof db.search.flush === 'function') {
      db.search.flush();
    }

    if (db.graph) {
      A.truth(typeof db.graph === 'object', 'graph manager exists');
    }

    if (db.vector) {
      A.truth(typeof db.vector === 'object', 'vector manager exists');
    }
  }
}

module.exports = QuerySearchGraphProbe;
