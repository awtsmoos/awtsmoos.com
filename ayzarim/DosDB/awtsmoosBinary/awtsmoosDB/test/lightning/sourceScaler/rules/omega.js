
// B"H

/**
 * @file test/lightning/sourceScaler/rules/omega.js
 * @chapter The Abyss Receives One Measured Depth
 * @description
 * Omega must scale creation and traversal together.
 * If the abyss is created with one depth but read with another, level_29 breaks.
 */

const B = require('../ruleBuilder.js');

/**
 * @function omegaRules
 * @description Returns omega source rewrite rules.
 * @returns {Array<[RegExp,string]>} Rewrite rules.
 */
function omegaRules() {
  return [
    B.replaceConst('DEPTH', 200, 36),
    B.replaceLoopLimit('i', 200, 'for(let i=0; i<DEPTH; i++)'),
    B.replaceConst('ITEMS', 1000, 180),
    [
      /for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*500\s*;\s*i\+\+\s*\)\s*timeline\.splice\s*\(\s*0\s*,\s*1\s*\)\s*;/g,
      'for(let i=0; i<90; i++) timeline.splice(0, 1);'
    ],
    [
      /assert\s*\(\s*tlLen\s*===\s*ITEMS\s*-\s*500\s*,\s*"Compacted Sequence length survived"\s*\)\s*;/g,
      'assert(tlLen === ITEMS - 90, "Compacted Sequence length survived");'
    ],
    B.replaceConst('N', 100, 40),
    [
      /assert\s*\(\s*motorNeurons\.length\s*>\s*30\s*,\s*`Text Search found \$\{motorNeurons\.length\} Motor Neurons`\s*\)\s*;/g,
      'assert(motorNeurons.length > 8, `Text Search found ${motorNeurons.length} Motor Neurons`);'
    ]
  ];
}

module.exports = omegaRules;
