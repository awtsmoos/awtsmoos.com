// B"H
module.exports = {
    BLOCK_SIZE: 4096,
    HEADER_SIZE: 32,
    UNIT_SIZE: 32,
    // 4096 bytes / 32 bytes per unit = 128 units.
    // 128 units / 8 bits per byte = 16 bytes needed for bitmap.
    BITMAP_SIZE: 16, 
    BITMAP_OFFSET: 4, // After BlockType (4 bytes)
    
    MAGIC_JSON: 'BJ',
    MAGIC_ARRAY: 'BA',
    MAGIC_BTREE_NODE: 0x42, // BTree Node Magic (ASCII 'B')
    GUARD_BYTE: 0xFF, // Tail verification byte
    
    UNITS_PER_BLOCK: 128, // 4096 / 32
    MAX_ITEMS_PER_PAGE: 100, // Safe limit to prevent fragmentation issues
    
    BLOCK_TYPE: {
        FREE: 0,
        PAGE: 1, // Slab for small allocations (BTree nodes, etc)
        OVERFLOW: 2,
        COLLECTION_PAGE: 3 // Dedicated Page for Collection Keys (Exclusive access)
    },
    
    VAL_TYPE: {
        NULL: 0,
        UNDEFINED: 1,
        BOOLEAN_TRUE: 2,
        BOOLEAN_FALSE: 3,
        UINT8: 4,
        UINT16: 5,
        UINT32: 6,
        UINT64: 7,
        INT8_NEG: 8,
        INT16_NEG: 9,
        INT32_NEG: 10,
        INT64_NEG: 11,
        FLOAT_1: 12,
        FLOAT_2: 13,
        FLOAT_4: 14,
        FLOAT_NEG_1: 15,
        FLOAT_NEG_2: 16,
        FLOAT_NEG_4: 17,
        DOUBLE_POS: 18,
        DOUBLE_NEG: 19,
        STRING: 20,
        BUFFER: 21,
        ARRAY: 22,
        OBJECT: 23,
        DATE: 24,
        JS_BIGINT: 25,
        REGEXP: 26,
        MAP: 27,
        SET: 28,
        ERROR: 29,
        FUNCTION: 30,
        NAN: 31,
        INFINITY: 32,
        NEG_INFINITY: 33,
        STRING_RLE: 34,
        STRING_HEBREW: 35
    },
    
    SB_OFFSETS: {
        NEXT_SEQ_BLOCK: 32 // Offset in SuperBlock for generator state
    }
};