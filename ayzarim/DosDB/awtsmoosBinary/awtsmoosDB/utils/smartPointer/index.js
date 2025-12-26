// B"H
/**
 * @file index.js
 * @description
 *  The Keter of Pointers.
 *  Resolves physical pointers into hydrated JS reality instantly with Omni-Decompression.
 */

const codec = require('./codec.js');
const constants = require('../../constants.js');
const { readPointer48, writePointer48 } = require('../binaryHelpers.js');

class SmartPointer {
    static encode(type, mode, payload) { return codec.encode(type, mode, payload); }
    static decode(buf) { return codec.decode(buf); }

    static block(type, blockId, length = 0, isChain = false, offset = 0) {
        const payload = Buffer.allocUnsafe(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(length, 6);
        payload.writeUInt32BE(offset, 10);
        payload.writeUInt8(isChain ? 1 : 0, 14);
        return codec.encode(type, constants.MODE_BLOCK, payload);
    }

    static heap(type, blockId, offset, length) {
        const payload = Buffer.allocUnsafe(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(offset, 6);
        payload.writeUInt32BE(length, 10);
        return codec.encode(type, constants.MODE_HEAP, payload);
    }

    static resolve(ptrBuf, allocator) {
        const ptr = codec.decode(ptrBuf);
        if (!ptr) return undefined;

        if (ptr.mode === constants.MODE_INLINE) {
            return require('./hydrator_inline_sync.js')(ptr.type, ptr.payload, allocator);
        }

        const blockId = readPointer48(ptr.payload, 0);
        const length = (ptr.mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(6) : ptr.payload.readUInt32BE(10);
        const offset = (ptr.mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(10) : ptr.payload.readUInt32BE(6);
        const isChain = (ptr.mode === constants.MODE_BLOCK) && ptr.payload.readUInt8(14) === 1;

        if (ptr.mode === constants.MODE_BLOCK && (
            ptr.type === constants.VAL_TYPE.SEQUENCE || 
            ptr.type === constants.VAL_TYPE.MAP || 
            ptr.type === constants.VAL_TYPE.DICTIONARY
        )) {
            return { isStructure: true, type: ptr.type, blockId, length, offset, isChain };
        }

        const db = allocator.v1.db;
        let raw;
        if (ptr.mode === constants.MODE_HEAP) {
             const block = allocator.v1.readBlockLocked(blockId, true);
             raw = block.subarray(offset, offset + length);
        } else {
             raw = require('../../core/db/io.js').readChainSafe(db, { blockId, length, isChain, offset });
        }

        if (!raw) return undefined;
        return require('./hydrator_value_sync.js')(ptr.type, raw, allocator);
    }
}

module.exports = SmartPointer;
