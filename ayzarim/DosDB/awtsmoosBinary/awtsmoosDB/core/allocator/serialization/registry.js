
// B"H
const constants = require("../../../constants.js");
const bigIntUtils = require("../../../utils/bigIntUtils.js");
const serializeNumber = require("./number.js");

module.exports = {
    'undefined': () => ({ type: constants.VAL_TYPE.UNDEFINED, data: null }),
    'boolean': (val) => ({ 
        type: val ? constants.VAL_TYPE.BOOLEAN_TRUE : constants.VAL_TYPE.BOOLEAN_FALSE, 
        data: Buffer.from([val ? 1 : 0]) 
    }),
    'string': (val) => ({ type: constants.VAL_TYPE.STRING, data: Buffer.from(val, 'utf8') }),
    'symbol': (val) => ({ 
        type: constants.VAL_TYPE.SYMBOL, 
        data: Buffer.from(Symbol.keyFor(val) || val.description || "Symbol", 'utf8') 
    }),
    'bigint': (val) => {
        const { buffer, isNegative } = bigIntUtils.toBuffer(val);
        return { type: isNegative ? constants.VAL_TYPE.BIGINT_NEG : constants.VAL_TYPE.BIGINT_POS, data: buffer };
    },
    'function': (val) => ({ type: constants.VAL_TYPE.FUNCTION, data: Buffer.from(val.toString(), 'utf8') }),
    'number': (val) => serializeNumber(val)
};
