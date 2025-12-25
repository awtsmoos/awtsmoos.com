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

    // B"H: Smart Binary Types (Inline TOC)
    TYPE_SMART_OBJECT: 21,
    TYPE_SMART_ARRAY: 22,
    
    // Float Optimizations
    TYPE_FLOAT_1: 23,
    TYPE_FLOAT_2: 24,
    TYPE_FLOAT_4: 25,
    TYPE_FLOAT_NEG_1: 26,
    TYPE_FLOAT_NEG_2: 27,
    TYPE_FLOAT_NEG_4: 28,
    
    // Int Optimizations
    TYPE_UINT8: 29,
    TYPE_UINT16: 30,
    TYPE_UINT32: 31,
    TYPE_UINT64: 32,
    TYPE_INT8_NEG: 33,
    TYPE_INT16_NEG: 34,
    TYPE_INT32_NEG: 35,
    TYPE_INT64_NEG: 36,
    
    TYPE_DOUBLE_POS: 37,
    TYPE_DOUBLE_NEG: 38,
    
    TYPE_NAN: 39,
    TYPE_INFINITY: 40,
    TYPE_NEG_INFINITY: 41,

    // --- Internal Access Symbol ---
    SYMBOLS: {
        INTERNALS: Symbol.for('Awtsmoos.Internals')
    }
};

// B"H: Map VAL_TYPE for compatibility with serializeValue.js
module.exports.VAL_TYPE = {
    NULL: module.exports.TYPE_NULL,
    UNDEFINED: module.exports.TYPE_UNDEFINED,
    BOOLEAN_TRUE: module.exports.TYPE_BOOLEAN, // Handled with payload 1
    BOOLEAN_FALSE: module.exports.TYPE_BOOLEAN, // Handled with payload 0
    NAN: module.exports.TYPE_NAN,
    INFINITY: module.exports.TYPE_INFINITY,
    NEG_INFINITY: module.exports.TYPE_NEG_INFINITY,
    STRING: module.exports.TYPE_STRING,
    FUNCTION: module.exports.TYPE_FUNCTION,
    DATE: module.exports.TYPE_DATE,
    REGEXP: module.exports.TYPE_REGEXP,
    ERROR: module.exports.TYPE_ERROR,
    MAP: module.exports.TYPE_MAP,
    SET: module.exports.TYPE_SET,
    ARRAY: module.exports.TYPE_SEQUENCE, // Default to Sequence for Arrays
    OBJECT: module.exports.TYPE_DICTIONARY, // Default to Dictionary for Objects
    BUFFER: module.exports.TYPE_BUFFER,
    BIGINT_POS: module.exports.TYPE_BIGINT_POS,
    BIGINT_NEG: module.exports.TYPE_BIGINT_NEG,
    SYMBOL: module.exports.TYPE_SYMBOL,
    TYPED_ARRAY: module.exports.TYPE_TYPED_ARRAY,
    CUSTOM_INSTANCE: module.exports.TYPE_CUSTOM_INSTANCE, // B"H: Added Missing Mapping
    
    // Numeric Optimization Aliases
    UINT8: module.exports.TYPE_UINT8,
    UINT16: module.exports.TYPE_UINT16,
    UINT32: module.exports.TYPE_UINT32,
    UINT64: module.exports.TYPE_UINT64,
    INT8_NEG: module.exports.TYPE_INT8_NEG,
    INT16_NEG: module.exports.TYPE_INT16_NEG,
    INT32_NEG: module.exports.TYPE_INT32_NEG,
    INT64_NEG: module.exports.TYPE_INT64_NEG,
    FLOAT_1: module.exports.TYPE_FLOAT_1,
    FLOAT_2: module.exports.TYPE_FLOAT_2,
    FLOAT_4: module.exports.TYPE_FLOAT_4,
    FLOAT_NEG_1: module.exports.TYPE_FLOAT_NEG_1,
    FLOAT_NEG_2: module.exports.TYPE_FLOAT_NEG_2,
    FLOAT_NEG_4: module.exports.TYPE_FLOAT_NEG_4,
    DOUBLE_POS: module.exports.TYPE_DOUBLE_POS,
    DOUBLE_NEG: module.exports.TYPE_DOUBLE_NEG
};