
// B"H
/**
 * @file index.js
 * @description Encodes Null and Undefined directly as pure 0-length seals.
 */
const constants = require('../../../../../constants.js');
const SmartPointer = require('../../../../../utils/smartPointer.js');

class VoidTypeHandler {
    static handle(val, context) {
        const type = val === null ? constants.VAL_TYPE.NULL : constants.VAL_TYPE.UNDEFINED;
        return SmartPointer.encode(type, 0, 0);
    }
}
module.exports = VoidTypeHandler;
