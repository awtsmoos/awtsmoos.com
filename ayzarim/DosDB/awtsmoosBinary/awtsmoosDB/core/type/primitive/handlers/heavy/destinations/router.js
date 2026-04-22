
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
 */

const InlineDestination = require('./inline.js');
const SlabDestination = require('./slab.js');
const HeapDestination = require('./heap.js');
const V1Destination = require('./v1.js');

/**
 * @constant THRESHOLDS
 * @description Array of size limits and their corresponding manifestations.
 * Evaluated top-to-bottom. If the data size is <= max, it executes.
 */
const THRESHOLDS = [
    {
        max: 14,
        execute: (dataBuf, infoType, context) => InlineDestination.manifest(dataBuf, infoType)
    },
    {
        max: 128,
        execute: (dataBuf, infoType, context) => {
            const res = SlabDestination.manifest(dataBuf, infoType, context);
            // Fallback to Heap if Slabs are temporarily out of alignment
            if (!res) return HeapDestination.manifest(dataBuf, infoType, context);
            return res;
        }
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
     * @returns {Buffer} The finalized 16-byte seal.
     */
    static route(dataBuf, infoType, context) {
        const len = dataBuf.length;
        
        for (let i = 0; i < THRESHOLDS.length; i++) {
            if (len <= THRESHOLDS[i].max) {
                return THRESHOLDS[i].execute(dataBuf, infoType, context);
            }
        }
        
        // Failsafe (Infinity captures all, but just in case reality fractures)
        return V1Destination.manifest(dataBuf, infoType, context);
    }
}

module.exports = DestinationRouter;
