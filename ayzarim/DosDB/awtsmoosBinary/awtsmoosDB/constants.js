// B"H
/**
 * @file constants.js
 * @description The physical laws governing the AwtsmoosDB vessels.
 * Defines the atomic structure of data types and their unique identifiers.
 */

const BLOCK_SIZE = 4096;
const UNIT_SIZE = 32;
const HEADER_SIZE = 32;
const POINTER_SIZE = 16;
const BITMAP_OFFSET = 4;
const BITMAP_SIZE = 16;

const MAGIC_MAP_NODE = "AMAP";
const MAGIC_SEQ_NODE = "ASEQ";
const MAGIC_DICT_DIR = "ADIC";
const MAGIC_JSON = "AJS0";
const MAGIC_ARRAY = "AAR0";
const HEAP_PAGE_MAGIC = 0x4850;

const BLOCK_TYPE = {
    SUPER: 0,
    PAGE: 1,
    OVERFLOW: 2
};

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
    UINT8: 20,
    UINT16: 21,
    UINT32: 22,
    UINT64: 23,
    INT8_NEG: 24,
    INT16_NEG: 25,
    INT32_NEG: 26,
    INT64_NEG: 27,
    FLOAT_1: 28,
    FLOAT_2: 29,
    FLOAT_4: 30,
    FLOAT_NEG_1: 31,
    FLOAT_NEG_2: 32,
    FLOAT_NEG_4: 33,
    DOUBLE_POS: 34,
    DOUBLE_NEG: 35,
    NAN: 36,
    INFINITY: 37,
    NEG_INFINITY: 38,
    SYMBOL: 39,
    FUNCTION: 40,
    TYPED_ARRAY: 41,
    BOOLEAN_TRUE: 42,
    BOOLEAN_FALSE: 43,
    BIGINT_POS: 44,
    BIGINT_NEG: 45,
    ERROR: 46
};

const MODE_BLOCK = 0;
const MODE_HEAP = 1;
const MODE_INLINE = 2;

const SYMBOLS = {
    INTERNALS: Symbol.for('Awtsmoos.Internals')
};

module.exports = {
    BLOCK_SIZE,
    UNIT_SIZE,
    HEADER_SIZE,
    POINTER_SIZE,
    BITMAP_OFFSET,
    BITMAP_SIZE,
    
    MAGIC_MAP_NODE,
    MAGIC_SEQ_NODE,
    MAGIC_DICT_DIR,
    MAGIC_JSON,
    MAGIC_ARRAY,
    HEAP_PAGE_MAGIC,
    
    BLOCK_TYPE,
    VAL_TYPE,
    MODE_BLOCK,
    MODE_HEAP,
    MODE_INLINE,
    SYMBOLS,

    // B"H: Direct Aliases for Writers
    TYPE_MAP: VAL_TYPE.MAP,
    TYPE_SEQUENCE: VAL_TYPE.SEQUENCE,
    TYPE_DICTIONARY: VAL_TYPE.DICTIONARY,
    TYPE_SET: VAL_TYPE.SET,
    TYPE_OBJECT: VAL_TYPE.OBJECT,
    TYPE_ARRAY: VAL_TYPE.ARRAY,
    
    TYPE_STRING: VAL_TYPE.STRING,
    TYPE_NUMBER: VAL_TYPE.NUMBER,
    TYPE_BOOLEAN: VAL_TYPE.BOOLEAN,
    TYPE_NULL: VAL_TYPE.NULL,
    TYPE_UNDEFINED: VAL_TYPE.UNDEFINED,
    TYPE_CUSTOM_INSTANCE: VAL_TYPE.CUSTOM_INSTANCE,
    
    TYPE_SMART_OBJECT: VAL_TYPE.SMART_OBJECT,
    TYPE_SMART_ARRAY: VAL_TYPE.SMART_ARRAY
};