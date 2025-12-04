// B"H
module.exports = {
    BLOCK_SIZE: 4096,
    HEADER_SIZE: 64,
    UNIT_SIZE: 32,
    
    BITMAP_OFFSET: 4, // After Type (4 bytes)
    BITMAP_SIZE: 16,  // (4096-64)/32 = 126 bits -> 16 bytes
    
    MAGIC_JSON: "AwtsmoosJSON",
    MAGIC_ARRAY: "AwtsmoosARRAY",
    MAGIC_BTREE_NODE: 0x42,
    GUARD_BYTE: 0xFF,
    
    // B"H: Moved NEXT_SEQ_BLOCK to 64 to avoid Magic String collision in Block 0
    SB_OFFSETS: {
        NEXT_SEQ_BLOCK: 64 
    },

    BLOCK_TYPE: {
        FREE: 0,
        PAGE: 1, // Shared Small Blocks
        BTREE_NODE: 2,
        COLLECTION_HEADER: 3,
        COLLECTION_PAGE: 4,
        OVERFLOW: 5,
        META: 6
    },

    VAL_TYPE: {
        NULL: 0,
        UNDEFINED: 1,
        BOOLEAN_TRUE: 2,
        BOOLEAN_FALSE: 3,
        NAN: 4,
        INFINITY: 5,
        NEG_INFINITY: 6,
        
        UINT8: 10,
        UINT16: 11,
        UINT32: 12,
        UINT64: 13,
        
        INT8_NEG: 14,
        INT16_NEG: 15,
        INT32_NEG: 16,
        INT64_NEG: 17,
        
        DOUBLE_POS: 18,
        DOUBLE_NEG: 19,
        
        FLOAT_1: 20,
        FLOAT_2: 21,
        FLOAT_4: 22,
        FLOAT_NEG_1: 23,
        FLOAT_NEG_2: 24,
        FLOAT_NEG_4: 25,
        
        STRING: 30,
        STRING_RLE: 31,
        STRING_HEBREW: 32,
        
        BUFFER: 40,
        ARRAY: 50,
        OBJECT: 51,
        MAP: 52,
        SET: 53,
        DATE: 54,
        REGEXP: 55,
        ERROR: 56,
        FUNCTION: 57,
        JS_BIGINT: 58
    },
    
    MAX_ITEMS_PER_PAGE: 1000 // Safety limit
};