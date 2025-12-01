// B"H
// constants.js - FULL VERSION

module.exports = {
    // --- File Structure ---
    BLOCK_SIZE: 4096,
    UNIT_SIZE: 32, // Allocation Unit (Minimum chunk)
    HEADER_SIZE: 32, // Unified Block Header (Type + Bitmap + Padding)
    BITMAP_SIZE: 16, // 128 bits (tracks 128 units of 32 bytes)
    BITMAP_OFFSET: 4, // After 4-byte Type Identifier
    
    // --- Magic Headers ---
    MAGIC_JSON: "BJ", // B"H JSON
    MAGIC_ARRAY: "BA", // B"H Array

    // --- Block Types ---
    BLOCK_TYPE: {
        FREE: 0,
        PAGE: 1,      // B+ Tree Node / Bucket
        OVERFLOW: 2,  // Long Data Chain
        METADATA: 3   // DB Metadata / Registry
    },

    // --- Superblock Offsets (Block 0) ---
    SB_OFFSETS: {
        MAGIC: 0,          // 8 bytes
        VERSION: 8,        // 4 bytes
        NEXT_SEQ_BLOCK: 12 // 6 bytes (48-bit pointer to Allocator Cursor)
    },

    // --- Value Types (V2 Universal) ---
    VAL_TYPE: {
        // Special
        NULL: 0,
        UNDEFINED: 1,
        BOOLEAN_TRUE: 2,
        BOOLEAN_FALSE: 3,
        NAN: 4,
        INFINITY: 5,
        NEG_INFINITY: 6,
        
        // Integers
        UINT8: 7,
        UINT16: 8,
        UINT32: 9,
        UINT64: 10, // JS Number (safe range)
        
        INT8_NEG: 11,
        INT16_NEG: 12,
        INT32_NEG: 13,
        INT64_NEG: 14,
        
        // Floats
        FLOAT_1: 15, // Dynamic compression
        FLOAT_2: 16,
        FLOAT_4: 17,
        FLOAT_NEG_1: 18,
        FLOAT_NEG_2: 19,
        FLOAT_NEG_4: 20,
        DOUBLE_POS: 21,
        DOUBLE_NEG: 22,
        
        // Strings
        STRING: 23,
        STRING_RLE: 24,    // Run-Length Encoded
        STRING_HEBREW: 25, // Hebrew Compression
        
        // Containers
        OBJECT: 30,
        ARRAY: 31,
        MAP: 32,
        SET: 33,
        BUFFER: 34,
        
        // JS Objects
        DATE: 40,
        REGEXP: 41,
        ERROR: 42,
        FUNCTION: 43,
        JS_BIGINT: 44 // Actual BigInt
    },

    // --- Limits ---
    MAX_ITEMS_PER_PAGE: 100, // Buckets split after this
    UNITS_PER_BLOCK: 127     // (4096 - 32) / 32
};