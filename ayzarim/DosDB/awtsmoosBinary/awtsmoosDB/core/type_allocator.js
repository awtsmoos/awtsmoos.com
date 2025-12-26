// B"H
/**
 * @file type_allocator.js
 * @description
 *  The Sefirah of Chesed - The Infinite Flow of Contraction.
 *  Uses OmniCompressor and StructBuilder to minimize physical manifestation on disk synchronously.
 */

const constants = require('../constants.js');
const SmartPointer = require('../utils/smartPointer.js');
const omni = require('../utils/omniCompressor.js');

class AllocatorV2 {
    constructor(pager, db) {
        this.pager = pager;
        this.db = db;
        this.v1 = new (require('./allocator/index.js'))(pager, db);
        this.heap = new (require('./heap.js'))(this.v1);
        this.builder = new (require('../utils/structBuilder.js'))(this);
    }

    init() { this.v1.init(); }

    /**
     * @description Persists a value to disk synchronously, selecting the most dense representation.
     */
    save(val) {
        const T = constants.VAL_TYPE;
        
        if (val === null) return SmartPointer.encode(T.NULL, constants.MODE_INLINE, Buffer.alloc(15));
        if (val === undefined) return SmartPointer.encode(T.UNDEFINED, constants.MODE_INLINE, Buffer.alloc(15));
        
        if (typeof val === 'boolean') {
            const p = Buffer.alloc(15).fill(0); p[0] = val ? 1 : 0;
            return SmartPointer.encode(T.BOOLEAN, constants.MODE_INLINE, p);
        }
        
        if (typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 15) {
            const p = Buffer.alloc(15).fill(0); p[0] = val;
            return SmartPointer.encode(T.SMALL_INT, constants.MODE_INLINE, p);
        }

        if (typeof val === 'string') {
            const compressed = omni.pack(val);
            const originalLen = Buffer.byteLength(val, 'utf8');
            const finalType = (compressed.length < originalLen) ? T.STRING_OMNI : T.STRING;

            if (compressed.length <= 14) {
                const p = Buffer.alloc(15).fill(0);
                p[0] = compressed.length; 
                compressed.copy(p, 1);
                return SmartPointer.encode(finalType, constants.MODE_INLINE, p);
            }
            const loc = this.heap.allocate(compressed);
            return SmartPointer.heap(finalType, loc.blockId, loc.offset, loc.length);
        }

        // Handle complex objects and marker classes synchronously
        if (typeof val === 'object' && !Buffer.isBuffer(val)) {
            return this.builder.build(val);
        }

        // Fallback for raw Buffers or pre-serialized bits
        const data = (Buffer.isBuffer(val) && val.length !== 16) ? val : require('./allocator/serialize/serializeValue.js')(val, true);
        if (data.length <= 1024) {
            const loc = this.heap.allocate(data);
            return SmartPointer.heap(T.JSON, loc.blockId, loc.offset, loc.length);
        }
        const ptr = this.v1.allocate(data.length);
        this.db._writeChainSafe(ptr, data);
        return SmartPointer.block(T.JSON, ptr.blockId, data.length, ptr.isChain, ptr.offset);
    }

    flushHeap() { this.heap.flush(); }
}

module.exports = AllocatorV2;
