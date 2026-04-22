
// B"H
/**
 * @file index.js
 * @description Encodes absolute Truth and Falsehood directly into the seal.
 */
const constants = require('../../../../../constants.js');
const SmartPointer = require('../../../../../utils/smartPointer.js');

class BooleanTypeHandler {
    static handle(val, context) {
        const p = Buffer.alloc(15).fill(0); 
        p[0] = val ? 1 : 0;
        return SmartPointer.encode(constants.VAL_TYPE.BOOLEAN, constants.MODE_INLINE, p);
    }
}
module.exports = BooleanTypeHandler;
