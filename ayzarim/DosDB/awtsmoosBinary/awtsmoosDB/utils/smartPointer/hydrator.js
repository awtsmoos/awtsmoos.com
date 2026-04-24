
// B"H
/**
 * @file hydrator.js
 * @description 
 *  Bridges the physical world of exact-byte VarInts back into the ethereal world of JS.
 * 
 *  THE TIKKUN OF THE PURE CODEC:
 *  We have utterly purged the dark legacy of `ptr.payload` and `ptr.mode`. 
 *  The True Light has no modes. It simply has an offset and a length!
 *  This resolves the catastrophic 'Cannot read properties of undefined' crashes
 *  and establishes absolute harmony with the Pager.
 */

const constants = require('../../constants.js');
const codec = require('./codec.js');
const decodeValue = require('./hydrator/value.js');

module.exports = {
    resolve(ptrBuf, allocator, context) {
        if (!ptrBuf || ptrBuf.length === 0) return undefined;
        
        const ptr = codec.decode(ptrBuf, 0);
        if (!ptr) return undefined;

        const type = ptr.type;
        const T = constants.VAL_TYPE;

        // B"H: Structure Tagging. Recognize native JS containers as distinct entities 
        // to be handled by the Structural Hydrator, preserving their exact physical coordinates.
        const isContainer = (
            type === T.SEQUENCE || type === T.MAP || type === T.DICTIONARY ||
            type === T.SET || type === T.OBJECT || type === T.ARRAY || type === T.JSON ||
            type === T.JS_MAP || type === T.JS_SET || 
            type === T.SMART_OBJECT || type === T.SMART_ARRAY
        );

        if (isContainer) {
            return { 
                isStructure: true, 
                type: ptr.type, 
                offset: ptr.offset, 
                length: ptr.length, 
                ptr: ptrBuf 
            };
        }

        // B"H: Direct Exact-Byte Reading
        // The Light has no fragmentation. We look directly into the Pager's Universe.
        const db = allocator.v1 ? allocator.v1.db : allocator.db;
        const raw = db.pager.readExact(ptr.offset, ptr.length);

        if (!raw) return undefined;
        
        // Pass the raw essence to the Master Hydrator
        return decodeValue(ptr.type, raw, allocator, context);
    }
};
