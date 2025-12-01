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
        FLOAT_1: 14, // 1 byte custom float
        FLOAT_2: 15, // 2 byte custom float
        FLOAT_4: 16, // 4 byte custom float
        
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
        NAN: 26
    },

    // UPDATED OFFSETS:
    // Moved Magic to 4 to avoid overwriting Block Type (0-3).
    // Spaced out pointers to accommodate 6-byte (48-bit) values.
    SB_OFFSETS: {
        MAGIC: 4,               // Bytes 4-13 (10 chars)
        ROOT_COLLECTION_ID: 16, // Bytes 16-21 (6 bytes)
        NEXT_SEQ_BLOCK: 24,     // Bytes 24-29 (6 bytes)
        TOTAL_BLOCKS: 32        // Bytes 32-37 (6 bytes)
    }
};