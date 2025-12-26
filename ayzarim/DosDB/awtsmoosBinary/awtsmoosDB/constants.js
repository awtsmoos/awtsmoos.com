
// B"H
/**
 * @file constants.js
 * @description The physical laws governing the AwtsmoosDB vessels.
 */

module.exports = {
    BLOCK_SIZE: 4096,
    UNIT_SIZE: 32,
    HEADER_SIZE: 32,
    BITMAP_OFFSET: 4,
    BITMAP_SIZE: 16,
    MAGIC_MAP_NODE: "AMAP",
    MAGIC_SEQ_NODE: "ASEQ",
    MAGIC_DICT_DIR: "ADIC",
    MAGIC_JSON: "AJS0",
    MAGIC_ARRAY: "AAR0",
    HEAP_PAGE_MAGIC: 0x4850,
    
    BLOCK_TYPE: {
        SUPER: 0,
        PAGE: 1,
        OVERFLOW: 2
    },

    VAL_TYPE: {
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
        TYPED_ARRAY: 41
    },

    MODE_BLOCK: 0,
    MODE_HEAP: 1,
    MODE_INLINE: 2,

    SYMBOLS: {
        INTERNALS: Symbol.for('Awtsmoos.Internals')
    }
};
