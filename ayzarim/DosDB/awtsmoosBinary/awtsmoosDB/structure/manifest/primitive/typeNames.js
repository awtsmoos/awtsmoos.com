
// B"H

/**
 * @file structure/manifest/primitive/typeNames.js
 * @chapter The Names Of The Smallest Vessels
 * @description
 * The primitive world must not guess.
 * Each raw JavaScript spark needs one clear name before the binary body forms.
 */

const constants = require('../../../constants.js');

const T = constants.VAL_TYPE;

/**
 * @constant TYPE_NAMES
 * @description
 * Human names for primitive storage types.
 */
const TYPE_NAMES = {
  NULL: T.NULL,
  UNDEFINED: T.UNDEFINED,
  BOOLEAN: T.BOOLEAN,
  NUMBER: T.NUMBER,
  STRING: T.STRING,
  STRING_OMNI: T.STRING_OMNI,
  DATE: T.DATE,
  BIGINT: T.BIGINT,
  BIGINT_NEG: T.BIGINT_NEG,
  BUFFER: T.BUFFER,
  FUNCTION: T.FUNCTION,
  SYMBOL: T.SYMBOL,
  REGEXP: T.REGEXP,
  ARRAY_BUFFER: T.ARRAY_BUFFER,
  TYPED_ARRAY: T.TYPED_ARRAY,
  NAN: T.NAN,
  INFINITY: T.INFINITY,
  NEG_INFINITY: T.NEG_INFINITY
};

module.exports = TYPE_NAMES;
