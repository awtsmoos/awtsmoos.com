
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
    
    TYPE_BIGINT: 13,
    TYPE_SYMBOL: 14,
    TYPE_SET: 15,
    TYPE_TYPED_ARRAY: 16,
    TYPE_FUNCTION: 17,
    TYPE_CUSTOM_INSTANCE: 18,

    // --- Internal Access Symbol ---
    SYMBOLS: {
        INTERNALS: Symbol.for('Awtsmoos.Internals')
    }
};
