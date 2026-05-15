
// B"H

/**
 * @file constants.js
 * @chapter The Fixed Names Of The Binary Firmament
 * @description
 * The Awtsmoos creates each vessel with a boundary and a name.
 * These numeric names are the stable type letters used by pointers, readers,
 * writers, hydrators, tests, and ancient modules that still remember old names.
 */

const VAL_TYPE = {
  NULL: 0,
  UNDEFINED: 1,
  BOOLEAN: 2,
  SMALL_INT: 3,
  NUMBER: 4,
  STRING: 5,
  STRING_OMNI: 6,
  DATE: 7,
  BIGINT: 8,
  BUFFER: 9,
  ARRAY: 10,
  OBJECT: 11,
  MAP: 12,
  SET: 13,
  DICTIONARY: 14,
  SEQUENCE: 15,
  JSON: 16,
  CUSTOM_INSTANCE: 17,
  SMART_OBJECT: 18,
  SMART_ARRAY: 19,
  JS_MAP: 20,
  JS_SET: 21,
  ERROR: 22,
  FUNCTION: 23,
  SYMBOL: 24,
  REGEXP: 25,
  FLOAT_DYNAMIC: 26,
  ARRAY_BUFFER: 27,
  TYPED_ARRAY: 28,
  BIGINT_POS: 29,
  BIGINT_NEG: 30,
  BOOLEAN_TRUE: 31,
  BOOLEAN_FALSE: 32,
  UINT8: 33,
  UINT16: 34,
  UINT32: 35,
  UINT64: 36,
  INT8_NEG: 37,
  INT16_NEG: 38,
  INT32_NEG: 39,
  INT64_NEG: 40,
  DOUBLE_POS: 41,
  DOUBLE_NEG: 42,
  NAN: 43,
  INFINITY: 44,
  NEG_INFINITY: 45,
  BUFFER_OMNI: 46,
  ARRAY_BUFFER_OMNI: 47,
  TYPED_ARRAY_OMNI: 48,
  ENCRYPTED: 49,
  BLOB: 51,
  TEXT: 52,
  ANCHOR: 50
};

const constants = {
  BLOCK_SIZE: 4096,
  MAGIC_MAP: 'AMAP',
  MAGIC_SEQ_NODE: 'ASEQ',
  MAGIC_DIC: 'ADIC',
  MAGIC_ANCH: 'ANCH',
  VAL_TYPE,
  SYMBOLS: {
    INTERNALS: Symbol.for('Awtsmoos.Internals'),
    SOUL_SIG: Symbol.for('Awtsmoos.Soul')
  }
};

constants.TYPE_NULL = VAL_TYPE.NULL;
constants.TYPE_UNDEFINED = VAL_TYPE.UNDEFINED;
constants.TYPE_BOOLEAN = VAL_TYPE.BOOLEAN;
constants.TYPE_NUMBER = VAL_TYPE.NUMBER;
constants.TYPE_STRING = VAL_TYPE.STRING;
constants.TYPE_BUFFER = VAL_TYPE.BUFFER;
constants.TYPE_ARRAY = VAL_TYPE.ARRAY;
constants.TYPE_OBJECT = VAL_TYPE.OBJECT;
constants.TYPE_MAP = VAL_TYPE.MAP;
constants.TYPE_SET = VAL_TYPE.SET;
constants.TYPE_DICTIONARY = VAL_TYPE.DICTIONARY;
constants.TYPE_SEQUENCE = VAL_TYPE.SEQUENCE;
constants.TYPE_CUSTOM_INSTANCE = VAL_TYPE.CUSTOM_INSTANCE;

module.exports = constants;
