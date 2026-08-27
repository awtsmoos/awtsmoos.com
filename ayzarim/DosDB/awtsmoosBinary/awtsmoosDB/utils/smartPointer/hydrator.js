
// B"H
/**
 * @file smartPointer/hydrator.js
 * @description
 * Chapter 100: The Resurrection of the Sparks.
 */

const constants = require('../../constants.js');
const codec = require('./codec.js');

module.exports = {
    /**
     * @method resolve
     * @description Converts binary coordinates back into living JavaScript entities.
     */
    resolve(ptrBuf, allocator, context) {
        if (!ptrBuf || ptrBuf.length === 0) return undefined;
        
        const ptr = codec.decode(ptrBuf, 0);
        if (!ptr) return undefined;

        const T = constants.VAL_TYPE;
        const ContainerTypes = [
            T.SEQUENCE, T.MAP, T.DICTIONARY, T.SET, T.OBJECT, T.ARRAY, 
            T.JSON, T.JS_MAP, T.JS_SET, T.SMART_OBJECT, T.SMART_ARRAY, T.ANCHOR
        ];

        // 1. Identify Structural Sovereignty
        if (ContainerTypes.includes(ptr.type)) {
            return { 
                isStructure: true, 
                type: ptr.type, 
                offset: ptr.offset, 
                length: ptr.length, 
                ptr: ptrBuf 
            };
        }

        // 2. Physical Extraction from the mirrored RAM firmament
        const db = allocator.v1 ? allocator.v1.db : allocator.db;
        const raw = db.pager.readExact(ptr.offset, ptr.length);

        if (!raw) return undefined;
        
        // 3. Delegate to the Divine Value Registry for final manifestation
        const decodeValue = require('../../api/liveHandle/reader/hydrator/index.js');
        return decodeValue(ptr.type, raw, allocator, context);
    }
};
