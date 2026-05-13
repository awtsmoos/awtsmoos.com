
// B"H

/**
 * @file structure/manifest/complex/builder/logic/typeTable.js
 * @chapter The Table Where Forms Receive Their Names
 * @description
 * Every structure enters the builder as a silent shape.
 * This tiny table gives the shape a name before any bytes are carved.
 * Maps become Map vessels.
 * Sets become Set vessels.
 * Arrays become Sequence vessels.
 * Objects become Dictionary vessels.
 */

const constants = require('../../../../../constants.js');
const MarkerLogic = require('../marker/index.js');

const T = constants.VAL_TYPE;

/**
 * @function detectType
 * @description
 * Resolves a JavaScript value into the database structure type.
 *
 * @param {*} val - Incoming non-primitive JavaScript value.
 * @returns {number} AwtsmoosDB structural VAL_TYPE.
 */
function detectType(val) {
  if (Array.isArray(val)) return T.SEQUENCE;
  if (val instanceof Set) return T.JS_SET;
  if (val instanceof Map) return T.JS_MAP;

  const marked = MarkerLogic.getTargetType(val);
  if (marked !== null) return marked;

  return T.DICTIONARY;
}

module.exports = {
  detectType
};
