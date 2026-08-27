
// B"H
/**
 * @file micro.js
 * @description Micro-Sparks (0-15) packed securely via Exact-Byte allocation.
 */
const constants = require('../../../../../constants.js');
const SmartPointer = require('../../../../../utils/smartPointer.js');

class MicroNumberHandler {
    static handle(val, context) {
        const p = Buffer.allocUnsafe(1);
        p[0] = val;
        const loc = (context.v1 || context.allocator.v1 || context.allocator).allocate(1);
        context.db.pager.writeExact(loc.offset, p);
        return SmartPointer.encode(constants.VAL_TYPE.SMALL_INT, loc.offset, 1);
    }
}
module.exports = MicroNumberHandler;
