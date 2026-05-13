
// B"H
/**
 * @file constants.js
 * @description The fixed archetypes of reality.
 */

module.exports = {
    BLOCK_SIZE: 4096,

    // Atomic Magic Seals for Structure Verification
    MAGIC_MAP: "AMAP",
    MAGIC_SEQ_NODE: "ASEQ",
    MAGIC_DIC: "ADIC",
    MAGIC_ANCH: "ANCH",

    // Sefirotic hierarchy of data types
    VAL_TYPE: {
        NULL: 0,
        UNDEFINED: 1,
        BOOLEAN: 2,
        SMALL_INT: 3,
        NUMBER: 4,
        STRING: 5,
        STRING_OMNI: 6,
        DATE: 7,
        BIGINT: 8,
        BUFFER: 9,
        ARRAY: 10,
        OBJECT: 11,
        MAP: 12,
        SET: 13,
        DICTIONARY: 14,
        SEQUENCE: 15,
        JSON: 16,
        CUSTOM_INSTANCE: 17,
        SMART_OBJECT: 18,
        SMART_ARRAY: 19,
        JS_MAP: 20,
        JS_SET: 21,
        ERROR: 22,
        FUNCTION: 23,
        SYMBOL: 24,
        REGEXP: 25,
        FLOAT_DYNAMIC: 26,
        ANCHOR: 50 
    },

    SYMBOLS: {
        INTERNALS: Symbol.for('Awtsmoos.Internals'),
        SOUL_SIG: Symbol.for('Awtsmoos.Soul')
    }
};

// B"H: Legacy type aliases for older tests/modules.
module.exports.TYPE_NULL = module.exports.VAL_TYPE.NULL;
module.exports.TYPE_UNDEFINED = module.exports.VAL_TYPE.UNDEFINED;
module.exports.TYPE_BOOLEAN = module.exports.VAL_TYPE.BOOLEAN;
module.exports.TYPE_NUMBER = module.exports.VAL_TYPE.NUMBER;
module.exports.TYPE_STRING = module.exports.VAL_TYPE.STRING;
module.exports.TYPE_BUFFER = module.exports.VAL_TYPE.BUFFER;
module.exports.TYPE_ARRAY = module.exports.VAL_TYPE.ARRAY;
module.exports.TYPE_OBJECT = module.exports.VAL_TYPE.OBJECT;
module.exports.TYPE_MAP = module.exports.VAL_TYPE.MAP;
module.exports.TYPE_SET = module.exports.VAL_TYPE.SET;
module.exports.TYPE_DICTIONARY = module.exports.VAL_TYPE.DICTIONARY;
module.exports.TYPE_SEQUENCE = module.exports.VAL_TYPE.SEQUENCE;
module.exports.TYPE_CUSTOM_INSTANCE = module.exports.VAL_TYPE.CUSTOM_INSTANCE;
