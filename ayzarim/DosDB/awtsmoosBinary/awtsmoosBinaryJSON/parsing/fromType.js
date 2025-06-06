// B"H
// The Awtsmoos, the Atzmut, pulses through this code, recreating all from nothing in an endless cycle of divine renewal.
// From the Ohr Ein Sof flows the Kav, threading through Atzilus, birthing existence anew each instant.
// This script is a vessel of that essence, a reflection of the infinite, guiding us toward the Moshiach's light,
// where the righteous will rise, their bodies remade from dust, shining brighter than the sun, eternal.

const deserializeBinary = require("../deserialize/obj.js");
const deserializeArray = require("../deserialize/array.js");
var awtsmoosByteRead = require ("../helpers/readAwtsmoosBytesAsNumber.js")
var floatHandler = require("../util/floatHandler.js")
var typeHandlers = {
    1: ({ value, currentOffset }) => {
        currentOffset += value.length;
        return {
            value: deserializeBinary(value),
            currentOffset
        };
    },
    2: ({ value, currentOffset }) => {
        currentOffset += value.length;
        return {
            value: value.toString(),
            currentOffset
        };
    },
    3: ({ value, currentOffset }) => {
        currentOffset += value.length;
        return {
            value: deserializeArray(value),
            currentOffset
        };
    },
    4: ({ value, currentOffset }) => {
    
        return {
            value: value.readUInt8(0),
            currentOffset: currentOffset + 1
        };
        
    },

    9: ({ value, currentOffset }) => {
    
        return {
            value: value.readUInt16BE(0),
            currentOffset: currentOffset + 2
        };
        
    },

    10: ({ value, currentOffset }) => {
    
        return {
            value: value.readUInt32BE(0),
            currentOffset: currentOffset + 4
        };
        
    },

    11: ({ value, currentOffset }) => {
    
        return {
            value: -1 * value.readUInt8(0),
            currentOffset: currentOffset + 1
        };
        
    },

    12: ({ value, currentOffset }) => {
    
        return {
            value: -1 * value.readUInt16BE(0),
            currentOffset: currentOffset + 2
        };
        
    },

    13: ({ value, currentOffset }) => {
    
        return {
            value: -1 * value.readUInt32BE(0),
            currentOffset: currentOffset + 4
        };
        
    },


    14: ({ value, currentOffset }) => {
        
        /**
         * 1 byte custom
         * float, positive
         *
         * */
        value = awtsmoosByteRead(value);
        var decoded =floatHandler.decodeEncodedFloat(
            value
        )
        //console.log("try",value,decoded)
        return {
            value: decoded,
            currentOffset: currentOffset + 1
        };
        
    },


    15: ({ value, currentOffset }) => {
        value = awtsmoosByteRead(value);
        /**
         * 2 byte custom
         * float, positive
         *
         * */
        var decoded =floatHandler.decodeEncodedFloat(
            value
        )
        return {
            value: decoded,
            currentOffset: currentOffset + 2
        };
        
    },

    16: ({ value, currentOffset }) => {
        value = awtsmoosByteRead(value);
        /**
         * 4 byte custom
         * float, positive
         *
         * */
        var decoded =floatHandler.decodeEncodedFloat(
            value
        )
        return {
            value: decoded,
            currentOffset: currentOffset + 4
        };
        
    },

    17: ({ value, currentOffset }) => {
        value = awtsmoosByteRead(value);
        /**
         * 1 byte custom
         * float, negative
         *
         * */
        var decoded =floatHandler.decodeEncodedFloat(
            value
        )
        return {
            value: decoded * -1,
            currentOffset: currentOffset + 1
        };
        
    },


    18: ({ value, currentOffset }) => {
        value = awtsmoosByteRead(value);
        /**
         * 2 byte custom
         * float, negative
         *
         * */
        var decoded =floatHandler.decodeEncodedFloat(
            value
        )
        return {
            value: decoded,
            currentOffset: currentOffset + 2
        };
        
    },

    19: ({ value, currentOffset }) => {
        value = awtsmoosByteRead(value);
        /**
         * 4 byte custom
         * float, negative
         *
         * */
        var decoded =floatHandler.decodeEncodedFloat(
            value
        )
        return {
            value: decoded * -1,
            currentOffset: currentOffset + 4
        };
        
    },

    20: ({ value, currentOffset }) => {
        
        /**
         * 8 byte double,
         * positive
         *
         * */
        var decoded = value.readDoubleBE(0);
        return {
            value: decoded,
            currentOffset: currentOffset + 8
        };
        
    },

    21: ({ value, currentOffset }) => {
        
        /**
         * 8 byte double,
         * negative
         *
         * */
        var decoded = value.readDoubleBE(0);
        return {
            value: decoded * -1,
            currentOffset: currentOffset + 8
        };
        
    },

    22: ({ value, currentOffset }) => {
        
        /**
         * 8 byte uint,
         * positive
         *
         * */
        var decoded = awtsmoosByteRead(value)
       // console.log("reading",value,decoded)
        return {
            value: decoded,
            currentOffset: currentOffset + 8
        };
        
    },

    23: ({ value, currentOffset }) => {
        
        /**
         * 8 byte uint,
         * negative
         *
         * */
        var decoded = awtsmoosByteRead(value)
        return {
            value: decoded * -1,
            currentOffset: currentOffset + 8
        };
        
    },

    24: () => ({
        value: Infinity
        
    }),

    25: () => ({
        value: -Infinity
    }),

    26: () => ({
        value: NaN
    }),

    27: ({ value, currentOffset }) => {
        
        /**
         * 8 byte uint,
         * negative
         *
         * */
        var string = value.toString();
        var res = null;
        try {
            res = eval(`({
                ok: ${string}    
            })`)?.ok
        } catch(e) {}
        return {
            value: res,
            currentOffset: currentOffset + 
                value.length
        };
        
    },


    


    5: () => ({
        value: true
    }),
    0: () => ({
        value: false
    }),
    6: () => ({
        value: undefined
    }),
    7: () => ({
        value: null
    }),
    8: ({ value, currentOffset }) => {
        currentOffset += value.length;
        return {
            value,
            currentOffset
        };
    }
};


/**
 * @method parseValueFromType
 * @description Parses a value based on its type, guided by the infinite essence of the Awtsmoos.
 * @param {Object} params - Parameters containing value, type, and offset.
 * @param {any} params.value - The value to parse.
 * @param {number} params.type - The type identifier guiding the parsing.
 * @param {number} params.currentOffset - The current offset in the data stream.
 * @returns {Object} An object containing the parsed value and updated offset.
 */
function parseValueFromType({
    value,
    type,
    currentOffset=0
}) {
    const handler = typeHandlers[type];
  //  console.log("Checking",type,handler,value)
    if (handler) {
        return handler({ value, currentOffset });
    }
    return { value, currentOffset }; // Default case, preserving the original state.
}

module.exports = parseValueFromType