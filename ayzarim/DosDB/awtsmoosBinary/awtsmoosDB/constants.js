// B"H
module.exports = {
    BLOCK_SIZE: 4096,
    HEADER_SIZE: 64,
    UNIT_SIZE: 16, 
    POINTER_SIZE: 16,
    
    BITMAP_OFFSET: 4, 
    BITMAP_SIZE: 32, 
    
    MAGIC_JSON: "AJS", 
    MAGIC_ARRAY: "AAR",
    HEAP_PAGE_MAGIC: 0x4850, 
    MAGIC_SEQ_NODE: "SN",
    MAGIC_DICT_DIR: "DD",
    MAGIC_MAP_NODE: "MN",
    
    BLOCK_TYPE: {
        FREE: 0, PAGE: 1, BTREE_NODE: 2, 
        COLLECTION_HEADER: 3, COLLECTION_PAGE: 4, 
        OVERFLOW: 5, META: 6, SUPERBLOCK: 7
    },

    MODE_INLINE: 0, 
    MODE_HEAP: 1,   
    MODE_BLOCK: 2,  

    // B"H: The 64 Sparks of Data (Unified Type Registry)
    VAL_TYPE: {
        NULL: 0, 
        UNDEFINED: 1, 
        BOOLEAN: 2, 
        SMALL_INT: 3, 
        STRING_7BIT: 4, 
        BUFFER: 5, 
        SEQUENCE: 6, 
        DICTIONARY: 7, 
        MAP: 8, 
        JSON: 9, 
        DATE: 10, 
        REGEXP: 11, 
        ERROR: 12, 
        FUNCTION: 13, 
        TYPED_ARRAY: 14, 
        CUSTOM_INSTANCE: 15, 
        SYMBOL: 16, 
        SET: 17, 
        
        // Scalar Manifestations
        UINT8: 24, 
        UINT16: 25, 
        UINT32: 26, 
        UINT64: 27,
        INT8_NEG: 28, 
        INT16_NEG: 29, 
        INT32_NEG: 30, 
        INT64_NEG: 31,
        FLOAT_1: 32, 
        FLOAT_2: 33, 
        FLOAT_4: 34,
        FLOAT_NEG_1: 35, 
        FLOAT_NEG_2: 36, 
        FLOAT_NEG_4: 37,
        DOUBLE_POS: 38, 
        DOUBLE_NEG: 39,
        NAN: 40, 
        INFINITY: 41, 
        NEG_INFINITY: 42,
        BOOLEAN_TRUE: 43,
        BOOLEAN_FALSE: 44,

        BIGINT: 19, 
        BIGINT_POS: 45,
        BIGINT_NEG: 46,
        
        STRING_OMNI: 20, 
        SMART_OBJECT: 21, 
        SMART_ARRAY: 22,
        STRING: 23 
    },

    SYMBOLS: { INTERNALS: Symbol.for('Awtsmoos.Internals') },
    DEFAULT_CACHE_BLOCKS: 500 
};
