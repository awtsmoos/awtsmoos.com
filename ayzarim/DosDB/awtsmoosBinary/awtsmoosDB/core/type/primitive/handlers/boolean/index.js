
// B"H
/**
 * @file index.js
 * @description Encodes absolute Truth and Falsehood natively.
 */
const constants = require('../../../../../constants.js');
const SmartPointer = require('../../../../../utils/smartPointer.js');

class BooleanTypeHandler {
    static handle(val, context) {
        const p = Buffer.allocUnsafe(1);
        p[0] = val ? 1 : 0;
        const loc = (context.v1 || context.allocator.v1 || context.allocator).allocate(1);
        context.db.pager.writeExact(loc.offset, p);
        return SmartPointer.encode(constants.VAL_TYPE.BOOLEAN, loc.offset, 1);
    }
}
module.exports = BooleanTypeHandler;
