
// B"H
/**
 * @file type_registry.js
 * @description
 *  The Celestial Map of Fundamental Essences.
 * 
 *  Every 'typeof' in the JavaScript universe is but a pale reflection of a 
 *  higher spiritual root. Just as inorganic matter is constantly sustained 
 *  by the permuted Hebrew letters of the Creator's speech—such as Aleph-Beis-Nun 
 *  forming "Even" (stone)—these primitive types must be mapped to their 
 *  exact eternal binary signatures to persist.
 * 
 *  This registry avoids the tangled, chaotic branches of 'switch' statements, 
 *  opting instead for a pure, data-driven emanation. It provides immediate, 
 *  synchronous mapping from abstract thought to definitive physical form.
 */

const constants = require("../../../constants.js");
const bigIntUtils = require("../../../utils/bigIntUtils.js");
const serializeNumber = require("./number_serializer.js");

/**
 * @constant TypeRegistry
 * @description A holy dictionary linking the `typeof` strings to their serialization rituals.
 */
const TypeRegistry = {
    'undefined': (val) => ({ 
        type: constants.VAL_TYPE.UNDEFINED, 
        data: null 
    }),
    
    'boolean': (val) => ({ 
        type: val ? constants.VAL_TYPE.BOOLEAN_TRUE : constants.VAL_TYPE.BOOLEAN_FALSE, 
        data: Buffer.from([val ? 1 : 0]) 
    }),
    
    'string': (val) => ({ 
        type: constants.VAL_TYPE.STRING, 
        data: Buffer.from(val, 'utf8') 
    }),
    
    'symbol': (val) => ({ 
        type: constants.VAL_TYPE.SYMBOL, 
        data: Buffer.from(Symbol.keyFor(val) || val.description || "Symbol", 'utf8') 
    }),
    
    'bigint': (val) => {
        const { buffer, isNegative } = bigIntUtils.toBuffer(val);
        return { 
            type: isNegative ? constants.VAL_TYPE.BIGINT_NEG : constants.VAL_TYPE.BIGINT_POS, 
            data: buffer 
        };
    },
    
    'function': (val) => ({ 
        type: constants.VAL_TYPE.FUNCTION, 
        data: Buffer.from(val.toString(), 'utf8') 
    }),
    
    'number': (val) => serializeNumber(val)
};

module.exports = TypeRegistry;
