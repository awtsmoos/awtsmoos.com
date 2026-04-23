
// B"H
/**
 * @file omni.js
 * @description
 *  =============================================================================
 *  CHAPTER 7: THE SCRIBE OF THE SPOKEN WORD (OMNI-COMPRESSION)
 *  =============================================================================
 *  Before a string is saved, it passes through the Omni-Compressor to squeeze 
 *  every ounce of redundant air from the letters. Then it is passed directly 
 *  to the Destination Router.
 */

const constants = require('../../../../../constants.js');
const omni = require('../../../../../utils/compression/omni.js');
const DestinationRouter = require('../heavy/destinations/router.js');

class StringTypeHandler {
    static handle(val, context) {
        const hasMarker = val.includes('\x07');
        const dataBuf = omni.pack(val);
        const infoType = hasMarker ? constants.VAL_TYPE.STRING_OMNI : constants.VAL_TYPE.STRING;
        
        // The Measure of True Weight
        if (context.db.metrics) {
            context.db.metrics.add(dataBuf.length);
        }

        // Delegate to the Data-Driven Dimension Router
        return DestinationRouter.route(dataBuf, infoType, context);
    }
}

module.exports = StringTypeHandler;
