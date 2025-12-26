
// B"H
/**
 * @file hydrator.js
 * @description
 *  The Sefirah of Binah - The Great Scribe.
 *  Translates raw physical blocks into the living language of JS.
 */

const constants = require('../../constants.js');
const { readPointer48 } = require('../binaryHelpers.js');
const codec = require('./codec.js');
const decodeInline = require('./hydrator_inline.js');
const decodeValue = require('./hydrator_value.js');

module.exports = {
    /**
     * @description The Great Resurrection. Resolves a pointer into a hydrated JS value.
     */
    async resolve(ptrBuf, allocator, context = new Map(), SmartPointer) {
        const ptr = codec.decode(ptrBuf);
        if (!ptr) return undefined;

        if (ptr.mode === constants.MODE_INLINE) {
            return await decodeInline(ptr.type, ptr.payload, allocator, context, SmartPointer);
        }

        const blockId = readPointer48(ptr.payload, 0);
        const length = (ptr.mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(6) : ptr.payload.readUInt32BE(10);
        const offset = (ptr.mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(10) : ptr.payload.readUInt32BE(6);
        const isChain = (ptr.mode === constants.MODE_BLOCK) && ptr.payload.readUInt8(14) === 1;

        const ctxKey = `${ptr.mode === constants.MODE_HEAP ? 'h' : 'b'}:${blockId}:${offset}`;
        if (context.has(ctxKey)) return context.get(ctxKey);

        // Structural optimization: descriptors for the reader
        if (ptr.mode === constants.MODE_BLOCK && (
            ptr.type === constants.TYPE_SEQUENCE || 
            ptr.type === constants.TYPE_MAP || 
            ptr.type === constants.TYPE_DICTIONARY ||
            ptr.type === constants.TYPE_SET
        )) {
            return { isStructure: true, type: ptr.type, blockId, length, offset, isChain };
        }

        let raw;
        if (ptr.mode === constants.MODE_HEAP) {
             const block = await allocator.readBlock(blockId, false); 
             if (!block) return undefined;
             
             if (offset + length > block.length) {
                 raw = await allocator.v1.db._readChainSafe({ blockId, offset, length, isChain: false });
             } else {
                 raw = block.subarray(offset, offset + length);
             }
        } else {
             raw = await allocator.v1.db._readChainSafe({ blockId, length, isChain, offset });
        }

        if (!raw) return undefined;
        return await decodeValue(ptr.type, raw, allocator, context, ctxKey, SmartPointer);
    },

    decodeInline,
    decodeValue
};
