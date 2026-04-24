
// B"H
/**
 * @file router.js
 * @description
 *  =============================================================================
 *  CHAPTER 5: THE SCALES OF JUSTICE (DATA-DRIVEN ROUTING)
 *  =============================================================================
 *  To determine where a spark of data belongs, we weigh it against the Thresholds 
 *  of Reality. By mapping sizes directly to Angels (Destinations), we abolish 
 *  the need for conditional branching (if/else). The Awtsmoos acts with instant certainty.
 * 
 *  THE TIKKUN: All destinations now operate under the unified Exact-Byte paradigm.
 */

const InlineDestination = require('./inline.js');
const SlabDestination = require('./slab.js');
const HeapDestination = require('./heap.js');
const V1Destination = require('./v1.js');

const THRESHOLDS = [
    {
        max: 14,
        execute: (dataBuf, infoType, context) => InlineDestination.manifest(dataBuf, infoType, context)
    },
    {
        max: 128,
        execute: (dataBuf, infoType, context) => SlabDestination.manifest(dataBuf, infoType, context)
    },
    {
        max: 1024,
        execute: (dataBuf, infoType, context) => HeapDestination.manifest(dataBuf, infoType, context)
    },
    {
        max: Infinity,
        execute: (dataBuf, infoType, context) => V1Destination.manifest(dataBuf, infoType, context)
    }
];

class DestinationRouter {
    /**
     * @method route
     * @description Finds the exact dimensional fit for the data based purely on its weight.
     * @param {Buffer} dataBuf The raw binary data.
     * @param {number} infoType The metadata type.
     * @param {Object} context Universal DB tools.
     * @returns {Buffer} The finalized VarInt seal.
     */
    static route(dataBuf, infoType, context) {
        const len = dataBuf.length;
        
        for (let i = 0; i < THRESHOLDS.length; i++) {
            if (len <= THRESHOLDS[i].max) {
                return THRESHOLDS[i].execute(dataBuf, infoType, context);
            }
        }
        
        return V1Destination.manifest(dataBuf, infoType, context);
    }
}

module.exports = DestinationRouter;
