
// B"H

/**
 * @file test/lightning/sourceScaler/rules/index.js
 * @chapter The Ledger Of Scaled Trials
 * @description
 * Data-based rule registry.
 */

const omegaRules = require('./omega.js');
const heavyRules = require('./heavy.js');

module.exports = {
  omega_simulation: omegaRules(),
  mega_simulation: heavyRules(),
  genesis: heavyRules(),
  simulate_eternity: heavyRules(),
  ultimate_chaos: heavyRules(),
  stress_test: heavyRules(),
  persistence_stress: heavyRules()
};
