
// B"H

/**
 * @file api/liveHandle/reader/hydrator/complex.js
 * @chapter The Complex Gates
 * @description
 * Extra scalar-like complex values that are not containers.
 */

const constants = require('../../../../constants.js');
const reviveRegExp = require('./regexp.js');
const T = constants.VAL_TYPE;

module.exports = {
  [T.REGEXP]: reviveRegExp
};
