// B"H
module.exports = {
    BLOCK_SIZE: 4096,
    UNIT_SIZE: 32, 
    HEADER_SIZE: 32, // Bytes 0-31 are System Headers
    
    UNITS_PER_BLOCK: 128, 
    BITMAP_OFFSET: 4, 
    BITMAP_SIZE: 16, 
    
    BLOCK_TYPE: {
        FREE: 0,
        PAGE: 1,
        OVERFLOW: 2,
        METADATA: 3
    },
    
    VAL_TYPE: {
        NULL: 0,
        UNDEFINED: 1,
        BOOLEAN_TRUE: 2,
        BOOLEAN_FALSE: 3,
        UINT8: 10,
        UINT16: 11,
        UINT32: 12,
        UINT64: 13,
        INT8_NEG: 14,
        INT16_NEG: 15,
        INT32_NEG: 16,
        INT64_NEG: 17,
        FLOAT_1: 20,
        FLOAT_2: 21,
        FLOAT_4: 22,
        FLOAT_NEG_1: 23,
        FLOAT_NEG_2: 24,
        FLOAT_NEG_4: 25,
        DOUBLE_POS: 26,
        DOUBLE_NEG: 27,
        STRING: 40,
        STRING_RLE: 41,
        STRING_HEBREW: 42,
        BUFFER: 50,
        ARRAY: 60,
        OBJECT: 70,
        DATE: 80,
        REGEXP: 81,
        MAP: 82,
        SET: 83,
        ERROR: 84,
        JS_BIGINT: 85,
        FUNCTION: 86,
        NAN: 90,
        INFINITY: 91,
        NEG_INFINITY: 92
    },

    MAGIC_JSON: 'BJ',
    MAGIC_ARRAY: 'BA',
    
    SB_OFFSETS: {
        MAGIC: 0,
        VERSION: 8,
        ROOT_COLLECTION: 12,
        NEXT_SEQ_BLOCK: 20
    },

    MAX_ITEMS_PER_PAGE: 50
};