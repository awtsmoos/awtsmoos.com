// B"H
/**
 * @file hydrator_inline_sync.js
 * @description Synchronous bit-packed and inlined-string rehydration.
 */

const constants = require('../../constants.js');
const bitStreamer = require('../bitStreamer.js');

module.exports = function hydrateInlineSync(type, payload, allocator) {
    const T = constants.VAL_TYPE;

    if (type === T.NULL) return null;
    if (type === T.UNDEFINED) return undefined;
    if (type === T.BOOLEAN) return payload[0] === 1;
    if (type === T.SMALL_INT) return payload[0];
    
    if (type === T.STRING_7BIT) {
        const charCount = payload[0];
        const data = payload.subarray(1);
        return bitStreamer.unpack7Bit(data, charCount);
    }

    // Short-String Inlining Recovery
    if (type === T.STRING) {
        const len = payload[0];
        return payload.toString('utf8', 1, 1 + len);
    }

    if (type === T.NUMBER) return payload.readDoubleBE(0);
    
    return null;
};
