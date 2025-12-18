
// B"H
module.exports = {
    // --- Allocation & Block Constants (Physical Layer) ---
    BLOCK_SIZE: 4096,
    HEADER_SIZE: 64,
    UNIT_SIZE: 32,
    POINTER_SIZE: 16,
    
    BITMAP_OFFSET: 4, // After Type (4 bytes)
    BITMAP_SIZE: 16,  // (4096-64)/32 = 126 bits -> 16 bytes
    
    // --- Magic Signatures ---
    MAGIC_JSON: "AwtsmoosJSON",
    MAGIC_ARRAY: "AwtsmoosARRAY",
    HEAP_PAGE_MAGIC: 0x4850, 
    MAGIC_SEQ_NODE: "SQND",
    MAGIC_DICT_DIR: "DDIR",
    MAGIC_MAP_NODE: "MPND",
    MAGIC_VEC_NODE: "VNOD",
    
    // --- Block Types ---
    BLOCK_TYPE: {
        FREE: 0,
        PAGE: 1,        // Shared Small Blocks (Heap)
        BTREE_NODE: 2,  // Legacy
        COLLECTION_HEADER: 3, // Legacy
        COLLECTION_PAGE: 4, // Legacy
        OVERFLOW: 5,    // Large Data Chain
        META: 6
    },

    // --- Storage Modes (Smart Pointer) ---
    MODE_INLINE: 0, 
    MODE_HEAP: 1,   
    MODE_BLOCK: 2,  

    // --- Universal Value Types ---
    TYPE_NULL: 0,
    TYPE_UNDEFINED: 1,
    TYPE_BOOLEAN: 2,
    TYPE_NUMBER: 3,
    TYPE_STRING: 4,
    TYPE_BUFFER: 5,
    TYPE_SEQUENCE: 6,
    TYPE_DICTIONARY: 7,
    TYPE_MAP: 8,
    TYPE_JSON: 9,
    
    TYPE_DATE: 10,
    TYPE_REGEXP: 11,
    TYPE_ERROR: 12,
    
    TYPE_BIGINT: 13, // Legacy / Generic
    TYPE_SYMBOL: 14,
    TYPE_SET: 15,
    TYPE_TYPED_ARRAY: 16,
    TYPE_FUNCTION: 17,
    TYPE_CUSTOM_INSTANCE: 18,
    
    // B"H: Optimized Binary BigInts
    TYPE_BIGINT_POS: 19,
    TYPE_BIGINT_NEG: 20,

    // --- Value Type Constants for Serializer (Internal) ---
    VAL_TYPE: {
        NULL: 0,
        UNDEFINED: 1,
        BOOLEAN_TRUE: 2,
        BOOLEAN_FALSE: 3,
        NAN: 4,
        INFINITY: 5,
        NEG_INFINITY: 6,
        
        // Integers (Variable Width)
        UINT8: 7,
        UINT16: 8,
        UINT32: 9,
        UINT64: 10,
        
        INT8_NEG: 11,
        INT16_NEG: 12,
        INT32_NEG: 13,
        INT64_NEG: 14,
        
        // Floats
        DOUBLE_POS: 15,
        DOUBLE_NEG: 16,
        
        // Compact Floats (1, 2, 4 bytes)
        FLOAT_1: 17,
        FLOAT_2: 18,
        FLOAT_4: 19,
        FLOAT_NEG_1: 20,
        FLOAT_NEG_2: 21,
        FLOAT_NEG_4: 22,
        
        // Containers
        STRING: 23,
        BUFFER: 24,
        ARRAY: 25,
        OBJECT: 26,
        
        // Complex
        DATE: 27,
        JS_BIGINT: 28, // Generic
        REGEXP: 29,
        MAP: 30,
        SET: 31,
        ERROR: 32,
        FUNCTION: 33,
        SYMBOL: 34,
        TYPED_ARRAY: 35,
        
        // String Optimizations
        STRING_RLE: 36,
        STRING_HEBREW: 37,
        
        // B"H: New Optimized BigInts
        BIGINT_POS: 38,
        BIGINT_NEG: 39
    },

    // --- Internal Access Symbol ---
    SYMBOLS: {
        INTERNALS: Symbol.for('Awtsmoos.Internals')
    }
};
