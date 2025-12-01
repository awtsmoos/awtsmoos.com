// B"H
// Constants for AwtsmoosDB
// Defining the Unified Physical Layout and Full Type System

module.exports = {
    // File Identity
    MAGIC_HEADER: "AWTS_DB_V2",
    MAGIC_JSON: "Aj",
    MAGIC_ARRAY: "Aa",
    
    // Physical Layout
    BLOCK_SIZE: 4096,
    UNIT_SIZE: 32,
    UNITS_PER_BLOCK: 128,
    BITMAP_OFFSET: 8,
    BITMAP_SIZE: 16,
    HEADER_SIZE: 32,
    MAX_ITEMS_PER_PAGE: 100,
    
    BLOCK_TYPE: {
        FREE: 0,
        SUPERBLOCK: 1,
        PAGE: 2,
        OVERFLOW: 3,
        DATA: 3
    },

    // FULL TYPE REGISTRY (Compatible with V1)
    VAL_TYPE: {
        // Boolean / Null
        BOOLEAN_FALSE: 0,
        BOOLEAN_TRUE: 5,
        UNDEFINED: 6,
        NULL: 7,
        
        // Structures
        OBJECT: 1,
        STRING: 2,
        ARRAY: 3,
        BUFFER: 8,
        FUNCTION: 27,
        
        // NEW UNIVERSAL TYPES
        DATE: 30,
        REGEXP: 31,
        MAP: 32,
        SET: 33,
        JS_BIGINT: 34,
        ERROR: 35,

        // Positive Integers
        UINT8: 4,
        UINT16: 9,
        UINT32: 10,
        UINT64: 22,

        // Negative Integers
        INT8_NEG: 11,
        INT16_NEG: 12,
        INT32_NEG: 13,
        INT64_NEG: 23,

        // Floats (Compressed)
        FLOAT_1: 14,
        FLOAT_2: 15,
        FLOAT_4: 16,
        
        // Negative Floats (Compressed)
        FLOAT_NEG_1: 17,
        FLOAT_NEG_2: 18,
        FLOAT_NEG_4: 19,

        // Standard Doubles
        DOUBLE_POS: 20,
        DOUBLE_NEG: 21,

        // Special Numbers
        INFINITY: 24,
        NEG_INFINITY: 25,
        NAN: 26,
        
	STRING_HEBREW: 36, // Custom 1-byte encoding
	STRING_RLE: 37,    // Run-Length Encoded
    },

    SB_OFFSETS: {
        MAGIC: 4,               
        ROOT_COLLECTION_ID: 16, 
        NEXT_SEQ_BLOCK: 24,     
        TOTAL_BLOCKS: 32        
    }
};