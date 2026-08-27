
// B"H
/**
 * @file utils/smartPointer/core/resolver.js
 * @description
 * Chapter 0.5: Techiyas HaMeisim (The Resurrection).
 * 
 * This module is the ultimate fulfiller of the Word. It takes the decoded coordinates 
 * and reaches back into the mirrored RAM firmament (the SSD). 
 * 
 * If the coordinates target a monumental Structure, it maintains its 
 * form as a Proxy. If it targets a simple Spark (Primitive), it rehydrates 
 * it into an atomic JS value.
 */

const SmartPointerDecoder = require('./decode.js');
const constants = require('../../../constants.js');

module.exports = {
    /**
     * @method execute
     * @description Final rehydration ritual.
     */
    execute(ptrBuf, allocator, context) {
        if (!ptrBuf || ptrBuf.length === 0) return undefined;
        
        const ptr = SmartPointerDecoder.execute(ptrBuf, 0);
        if (!ptr) return undefined;

        const T = constants.VAL_TYPE;
        const structuralTypes = [
            T.SEQUENCE, T.MAP, T.DICTIONARY, T.SET, T.OBJECT, T.ARRAY, 
            T.JSON, T.JS_MAP, T.JS_SET, T.SMART_OBJECT, T.SMART_ARRAY, T.ANCHOR
        ];

        // Route A: Identifying Structural Royalty
        if (structuralTypes.includes(ptr.type)) {
            return { 
                isStructure: true, 
                type: ptr.type, 
                offset: ptr.offset, 
                length: ptr.length, 
                ptr: ptrBuf 
            };
        }

        // Route B: Extracting Atomic Essence from the MIRROR
        // Achieving <100ms by reading from the Synchronous Pager's mirror.
        const db = allocator.v1 ? allocator.v1.db : allocator.db;
        const rawBytes = db.pager.readExact(ptr.offset, ptr.length);

        if (!rawBytes) return undefined;
        
        // Final Unveiling via the Rehydrator
        const ValueRehydrator = require('../../../api/liveHandle/reader/hydrator/index.js');
        return ValueRehydrator(ptr.type, rawBytes, allocator, context);
    }
};
