
// B"H
/**
 * @file index.js
 * @description
 *  =============================================================================
 *  CHAPTER 6: THE FORGE OF THE HEAVY SPARK (HEAVY HANDLER)
 *  =============================================================================
 *  Complex primitives (BigInts, Floats, Objects trapped as primitives) are 
 *  first serialized into binary, then passed to the Destination Router to 
 *  find their eternal home on the disk.
 */

const serializeValue = require('../../../../allocator/serialize/serializeValue.js');
const DestinationRouter = require('./destinations/router.js');

class HeavyTypeHandler {
    static handle(val, context) {
        // Contract the JavaScript entity into pure binary
        const info = serializeValue(val, false);
        const dataBuf = info.data || Buffer.alloc(0);
        const infoType = info.type;

        // The Measure of True Weight (Records the pure data size before physical padding)
        if (context.db.metrics) {
            context.db.metrics.add(dataBuf.length);
        }

        // Delegate to the Data-Driven Dimension Router
        return DestinationRouter.route(dataBuf, infoType, context);
    }
}

module.exports = HeavyTypeHandler;
