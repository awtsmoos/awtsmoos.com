
// B"H
/**
 * @file index.js (SmartPointer)
 * @description 
 *  =============================================================================
 *  CHAPTER 0: THE SEFIRAH OF KETER (THE CROWN AND ABSOLUTE IDENTITY)
 *  =============================================================================
 *  The SmartPointer is the 16-byte seal of existence. It contains the type, 
 *  the mode of storage, and the absolute physical coordinate of every spark 
 *  in the Awtsmoos database.
 */

const codec = require('./codec.js');
const constants = require('../../constants.js');
const { readPointer48, writePointer48 } = require('../binaryHelpers.js');
const hydrateInlineSync = require('./hydrator/inline.js');
const PayloadBuilder = require('./payload.js');
const IO = require('../../core/db/io.js');
const hydrateValueSync = require('./hydrator/value.js');

const SmartPointer = {
    encode(type, mode, payload) { 
        return codec.encode(type, mode, payload); 
    },

    decode(buf) { 
        if (!buf || buf.length !== 16) return null; 
        return codec.decode(buf); 
    },

    getType(buf) { 
        return (buf && buf.length > 0) ? buf[0] & 0x3F : 0; 
    },

    block(type, blockId, length = 0, isChain = false, offset = 0) {
        const payload = Buffer.allocUnsafe(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(length, 6);
        payload.writeUInt32BE(offset, 10);
        payload.writeUInt8(isChain ? 1 : 0, 14);
        return this.encode(type, constants.MODE_BLOCK, payload);
    },

    heap(type, blockId, offset, length) {
        const payload = Buffer.allocUnsafe(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(offset, 6);
        payload.writeUInt32BE(length, 10);
        return this.encode(type, constants.MODE_HEAP, payload);
    },

    toBuffer(ptr) {
        if (!ptr) return Buffer.alloc(16).fill(0);
        if (Buffer.isBuffer(ptr)) return (ptr.length === 16) ? ptr : Buffer.alloc(16).fill(0);

        if (typeof ptr === 'object') {
            const mode = ptr.mode !== undefined ? ptr.mode : (ptr.blockId !== undefined ? constants.MODE_BLOCK : constants.MODE_INLINE);
            const type = ptr.type !== undefined ? ptr.type : 0;
            const payload = PayloadBuilder.createPayload(ptr, mode);
            return this.encode(type, mode, payload);
        }
        return Buffer.alloc(16).fill(0);
    },

    decodeInline(type, payload, allocator) {
        return hydrateInlineSync(type, payload, allocator);
    },

    /**
     * @method resolve
     * @description Bridges the physical blocks back into JS.
     */
    resolve(ptrBuf, allocator, context) {
        if (!ptrBuf || ptrBuf.length !== 16) return undefined;
        
        const ptr = codec.decode(ptrBuf);
        if (!ptr) return undefined;

        const type = ptr.type;
        const mode = ptr.mode;

        if (mode === constants.MODE_INLINE) {
            return hydrateInlineSync(type, ptr.payload, allocator);
        }

        const blockId = readPointer48(ptr.payload, 0);
        const length = (mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(6) : ptr.payload.readUInt32BE(10);
        const offset = (mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(10) : ptr.payload.readUInt32BE(6);
        const isChain = (mode === constants.MODE_BLOCK) && ptr.payload.readUInt8(14) === 1;

        const T = constants.VAL_TYPE;
        
        // B"H: The Tikkun of Containers. We must recognize native JS Sets and Maps 
        // as true physical vessels so they are passed to the Structural Hydrator 
        // rather than the primitive binary reader.
        const isContainer = (
            type === T.SEQUENCE || type === T.MAP || type === T.DICTIONARY ||
            type === T.SET || type === T.OBJECT || type === T.ARRAY || type === T.JSON ||
            type === T.JS_MAP || type === T.JS_SET
        );

        if (mode === constants.MODE_BLOCK && isContainer) {
            return { isStructure: true, type: type, blockId, length, offset, isChain, ptr: ptrBuf };
        }

        const db = (allocator.v1 ? allocator.v1.db : allocator.db);
        let raw = null;

        if (mode === constants.MODE_HEAP) {
             let block = allocator.heap ? allocator.heap.readBlock(blockId) : null;
             if (!block) block = (allocator.v1 || allocator).readBlockLocked(blockId, true);
             if (block && offset + length <= block.length) raw = block.subarray(offset, offset + length);
        } else {
             raw = IO.readChainSafe(db, { blockId, length, isChain, offset });
        }

        if (!raw) return undefined;
        // B"H: Propagation of context to the hydrator
        return hydrateValueSync(type, raw, allocator, context);
    }
};

module.exports = SmartPointer;
