
// B"H
/**
 * @file inline.js
 * @description
 *  The Scribe of the Contracted Light.
 *  When the Essence is small enough to fit entirely within the 16-byte 
 *  SmartPointer seal, it is inlined, bypassing the disk allocation entirely.
 */

const constants = require('../../../constants.js');

module.exports = function hydrateInlineSync(type, payload, allocator) {
    const T = constants.VAL_TYPE;
    
    // The Absolute Voids
    if (type === T.NULL) return null;
    if (type === T.UNDEFINED) return undefined;
    
    // The Binary Truths (Directly mapped to Byte 0)
    if (type === T.BOOLEAN) return payload[0] === 1;
    if (type === T.SMALL_INT) return payload[0];
    
    // B"H: The Universal Doubling Shield of Inline Light
    // All other types packed by PrimitiveSaver use payload[0] to declare their 
    // exact length, and store the divine spark (data) in the remaining bytes. 
    // We extract this essence and pass it back to the Master Hydrator (ValueRegistry), 
    // ensuring perfect symmetry with every primitive type in existence (BigInt, Float, etc).
    const len = payload[0];
    
    // Safeguard against corrupted seals
    if (len > 14 || len < 0) return undefined;
    
    const data = payload.subarray(1, 1 + len);
    
    const hydrateValueSync = require('./value.js');
    return hydrateValueSync(type, data, allocator, null);
};
