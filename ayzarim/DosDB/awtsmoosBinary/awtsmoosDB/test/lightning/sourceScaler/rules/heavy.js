
// B"H

/**
 * @file test/lightning/sourceScaler/rules/heavy.js
 * @chapter The Heavy Mountains Become Swift Hills
 * @description
 * Generic safe reductions for huge stress simulations.
 * These are only used inside test/run_all.js lightning mode.
 */

const B = require('../ruleBuilder.js');

/**
 * @function heavyRules
 * @description Returns broad heavy-test rewrite rules.
 * @returns {Array<[RegExp,string]>} Rewrite rules.
 */
function heavyRules() {
  return [
    B.replaceConst('DEPTH', 200, 36),
    B.replaceConst('DEPTH', 100, 24),
    B.replaceConst('ITEMS', 5000, 650),
    B.replaceConst('ITEMS', 1000, 180),
    B.replaceConst('ITEMS', 500, 120),
    B.replaceConst('N', 5000, 650),
    B.replaceConst('N', 1000, 180),
    B.replaceConst('N', 500, 120),
    B.replaceConst('COUNT', 5000, 650),
    B.replaceConst('COUNT', 1000, 180),
    B.replaceConst('COUNT', 500, 120)
  ];
}

module.exports = heavyRules;
