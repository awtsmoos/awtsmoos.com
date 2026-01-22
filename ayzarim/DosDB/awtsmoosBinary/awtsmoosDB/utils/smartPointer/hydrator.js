// B"H
/**
 * @file hydrator.js
 * @description Bridges the physical world of blocks back into the ethereal world of JS.
 * STRICT: Ensures structure descriptors are identified authoritatively.
 */
const constants = require('../../constants.js');
const { readPointer48 } = require('../binaryHelpers.js');
const codec = require('./codec.js');
const decodeInline = require('./hydrator_inline_sync.js');
const decodeValue = require('./hydrator_value_sync.js');

module.exports = {
    resolve(ptrBuf, allocator) {
        const ptr = codec.decode(ptrBuf);
        if (!ptr) return undefined;

        if (ptr.mode === constants.MODE_INLINE) {
            return decodeInline(ptr.type, ptr.payload, allocator);
        }

        const blockId = readPointer48(ptr.payload, 0);
        const isChain = (ptr.mode === constants.MODE_BLOCK) && ptr.payload.readUInt8(14) === 1;
        const length = (ptr.mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(6) : ptr.payload.readUInt32BE(10);
        const offset = (ptr.mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(10) : ptr.payload.readUInt32BE(6);

        // AUTHORITATIVE STRUCTURE DETECTION
        // B"H: These are the Four Worlds of Container Vessels.
        if (ptr.mode === constants.MODE_BLOCK && (
            ptr.type === constants.VAL_TYPE.SEQUENCE || 
            ptr.type === constants.VAL_TYPE.MAP || 
            ptr.type === constants.VAL_TYPE.DICTIONARY ||
            ptr.type === constants.VAL_TYPE.SET ||
            ptr.type === constants.VAL_TYPE.ARRAY ||
            ptr.type === constants.VAL_TYPE.OBJECT
        )) {
            return { isStructure: true, type: ptr.type, blockId, length, offset, isChain };
        }

        const db = allocator.v1 ? allocator.v1.db : allocator.db;
        let raw = null;
        
        if (ptr.mode === constants.MODE_HEAP) {
             let block = allocator.heap ? allocator.heap.readBlock(blockId) : null;
             if (!block) {
                 const v1 = allocator.v1 || allocator;
                 block = v1.readBlockLocked(blockId, true);
             }
             if (block && offset + length <= block.length) {
                 raw = block.subarray(offset, offset + length);
             }
        } else {
             raw = require('../../core/db/io.js').readChainSafe(db, { blockId, length, isChain, offset });
        }

        if (!raw) return undefined;
        return decodeValue(ptr.type, raw, allocator);
    }
};