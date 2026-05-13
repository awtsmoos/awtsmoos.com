
// B"H

/**
 * @file test/lightning/fastSuites/suite.js
 * @chapter The Small Complete Trial
 * @description
 * Runs a compact but real DB validation suite.
 */

const DbHarness = require('./dbHarness.js');
const ScalarProbe = require('./probes/scalars.js');
const ContainerProbe = require('./probes/containers.js');
const NestingProbe = require('./probes/nesting.js');
const QuerySearchGraphProbe = require('./probes/querySearchGraph.js');
const PersistenceProbe = require('./probes/persistence.js');

/**
 * @class LightningSuite
 * @description
 * Replacement suite for huge stress simulations.
 */
class LightningSuite {
  /**
   * @constructor
   * @param {string} name - Suite name.
   */
  constructor(name) {
    this.name = name;
    this.harness = new DbHarness(name);
    this.persistence = new PersistenceProbe();
    this.probes = [
      new ScalarProbe(),
      new ContainerProbe(),
      new NestingProbe(),
      new QuerySearchGraphProbe()
    ];
  }

  /**
   * @method run
   * @description Executes compact real DB validation.
   * @returns {void}
   */
  run() {
    let db = this.harness.open();

    for (const probe of this.probes) {
      probe.run(db);
    }

    this.persistence.write(db);
    db = this.harness.reopen();
    this.persistence.read(db);

    this.harness.close();
  }
}

module.exports = LightningSuite;
