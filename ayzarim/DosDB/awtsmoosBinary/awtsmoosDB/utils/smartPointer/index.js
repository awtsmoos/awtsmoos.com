
// B"H
/**
 * @file index.js (SmartPointer)
 * @description 
 *  =============================================================================
 *  CHAPTER 0: THE SEFIRAH OF KETER (THE CROWN AND ABSOLUTE IDENTITY)
 *  =============================================================================
 *  The SmartPointer is the seal of existence. It contains the type and 
 *  absolute physical coordinate of every spark in the Awtsmoos database.
 * 
 *  "And He called them by their names..."
 *  The Navigator demands to know the Name (Type) of the vessel before entering it.
 *  We hereby restore the `getType` revelation.
 */

const codec = require('./codec.js');
const hydrateValueSync = require('./hydrator/value.js');
const constants = require('../../constants.js');

const SmartPointer = {
    /**
     * @method encode
     * @description Delegates to the VarInt Codec.
     */
    encode(type, offset, length) { 
        return codec.encode(type, offset, length); 
    },

    /**
     * @method decode
     * @description Expands the VarInt pointer.
     */
    decode(buf, start = 0) { 
        return codec.decode(buf, start); 
    },

    /**
     * @method readSize
     * @description Returns the microscopic footprint of the pointer.
     */
    readSize(buf, start = 0) {
        return codec.readSize(buf, start);
    },

    /**
     * @method getType
     * @description 
     *  Instantly reveals the Divine Type of the pointer by peeking at the seal.
     *  Restores harmony to the Navigator.
     */
    getType(buf, start = 0) {
        if (!buf || buf.length <= start) return 0;
        const dec = codec.decode(buf, start);
        return dec ? dec.type : 0;
    },

    /**
     * @method block
     * @description Legacy bridge for backwards compatibility. Offset IS the absolute location.
     */
    block(type, blockId, length = 0, isChain = false, offset = 0) {
        const absoluteOffset = offset || blockId || 0; 
        return this.encode(type, absoluteOffset, length);
    },

    /**
     * @method heap
     * @description Legacy bridge for the Nullified Heap. Maps to standard encode.
     */
    heap(type, blockId, offset, length) {
        const absoluteOffset = offset || blockId || 0;
        return this.encode(type, absoluteOffset, length);
    },

    /**
     * @method toBuffer
     * @description Ensures a pointer is always a raw binary buffer.
     */
    toBuffer(ptr) {
        if (!ptr) return Buffer.alloc(0);
        if (Buffer.isBuffer(ptr)) return ptr;
        return this.encode(ptr.type || 0, ptr.offset || 0, ptr.length || 0);
    },

    /**
     * @method resolve
     * @description 
     *  Bridges the physical bytes back into JS logic. 
     *  Uses the Pager's exact-byte reading to instantly manifest the vessel.
     */
    resolve(ptrBuf, allocator, context) {
        if (!ptrBuf || ptrBuf.length === 0) return undefined;
        
        const ptr = codec.decode(ptrBuf, 0);
        if (!ptr) return undefined;

        const type = ptr.type;
        const T = constants.VAL_TYPE;

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

        const db = allocator.v1 ? allocator.v1.db : allocator.db;
        const raw = db.pager.readExact(ptr.offset, ptr.length);

        if (!raw) return undefined;
        
        return hydrateValueSync(ptr.type, raw, allocator, context);
    }
};

module.exports = SmartPointer;
