
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
        // B"H 2026-11-12 (bulk-load skip-compression): when
        // AWTSMOOS_SKIP_OMNI=1, store the string uncompressed. omni.pack
        // is 93% of bulk-load build time but saves only ~19% of bytes;
        // skipping it makes bulk builds ~14x faster. The live app never
        // sets this flag, so live behavior is unchanged. The reader
        // already handles both VAL_TYPE.STRING and STRING_OMNI.
        if (process.env.AWTSMOOS_SKIP_OMNI === '1') {
            const dataBuf = Buffer.from(val, 'utf8');
            if (context.db.metrics) {
                context.db.metrics.add(dataBuf.length);
            }
            return DestinationRouter.route(dataBuf, constants.VAL_TYPE.STRING, context);
        }
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
