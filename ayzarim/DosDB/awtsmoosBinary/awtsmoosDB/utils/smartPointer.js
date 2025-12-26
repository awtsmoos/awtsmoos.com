// B"H
/**
 * @file smartPointer.js
 * @description Encodes and decodes the 16-byte pointers connecting the vessels.
 */

const constants = require('../constants.js');
const { writePointer48, readPointer48 } = require('./binaryHelpers.js');

const SmartPointer = {
    /**
     * @description Encodes a pointer with type and mode metadata.
     */
    encode(type, mode, payload) {
        const buffer = Buffer.alloc(16);
        buffer[0] = (type & 0x3F) | (mode << 6);
        payload.copy(buffer, 1);
        return buffer;
    },

    /**
     * @description Decodes the metadata from a 16-byte buffer.
     */
    decode(buffer) {
        if (!buffer || buffer.length !== 16) return null;
        const header = buffer[0];
        const type = header & 0x3F;
        const mode = (header >> 6) & 0x03;
        return { type, mode, payload: buffer.subarray(1) };
    },

    /**
     * @description Manifests a Block-mode pointer.
     */
    block(type, blockId, length, isChain, offset = 0) {
        const payload = Buffer.alloc(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(length, 6);
        payload.writeUInt32BE(offset, 10);
        payload[14] = isChain ? 1 : 0;
        return this.encode(type, constants.MODE_BLOCK, payload);
    },

    /**
     * @description Manifests a Heap-mode pointer.
     */
    heap(type, blockId, offset, length) {
        const payload = Buffer.alloc(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(offset, 6);
        payload.writeUInt32BE(length, 10);
        return this.encode(type, constants.MODE_HEAP, payload);
    },

    /**
     * @description 
     *  Synchronously resolves a pointer into a value or structure descriptor.
     *  The Essence becomes usable reality instantly.
     */
    resolve(ptrBuf, allocator, context = new Map()) {
        const info = this.decode(ptrBuf);
        if (!info) return undefined;

        if (info.mode === constants.MODE_INLINE) {
            return this.decodeInline(info.type, info.payload);
        }

        if (info.mode === constants.MODE_BLOCK) {
            const blockId = readPointer48(info.payload, 0);
            const length = info.payload.readUInt32BE(6);
            const offset = info.payload.readUInt32BE(10);
            const isChain = info.payload[14] === 1;
            
            // B"H: If it is a structural type, return the descriptor.
            // Otherwise, read and decode via the adapter to maintain type-alignment.
            const T = constants.VAL_TYPE;
            if (info.type === T.MAP || info.type === T.SEQUENCE || info.type === T.DICTIONARY || info.type === T.CUSTOM_INSTANCE) {
                return { isStructure: true, type: info.type, blockId, length, offset, isChain };
            }

            const data = allocator.v1.db._readChainSafe({ blockId, length, isChain, offset });
            const adapter = require('../deserialize/v1_adapter.js');
            return adapter.decode(data, info.type);
        }

        if (info.mode === constants.MODE_HEAP) {
            const blockId = readPointer48(info.payload, 0);
            const offset = info.payload.readUInt32BE(6);
            const length = info.payload.readUInt32BE(10);
            
            const block = allocator.v1.readBlockLocked(blockId);
            const data = Buffer.allocUnsafe(length);
            block.copy(data, 0, offset, offset + length);
            
            // B"H: FIX - Do NOT pass raw data to the self-describing parser.
            // Use the adapter to inform the parser of the type stored in the pointer.
            const adapter = require('../deserialize/v1_adapter.js');
            return adapter.decode(data, info.type);
        }
    },

    /**
     * @description Extracts small values directly from the pointer payload.
     */
    decodeInline(type, payload) {
        const T = constants.VAL_TYPE;
        switch (type) {
            case T.NULL: return null;
            case T.UNDEFINED: return undefined;
            case T.BOOLEAN: return payload[0] === 1;
            case T.SMALL_INT: return payload[0];
            case T.STRING: 
            case T.STRING_OMNI:
                const len = payload[0];
                const raw = payload.subarray(1, 1 + len);
                if (type === T.STRING_OMNI) {
                    const omni = require('./omniCompressor.js');
                    return omni.unpack(raw);
                }
                return raw.toString('utf8');
            default: return payload;
        }
    },

    getType: (buf) => buf[0] & 0x3F,
    getBlockId: (buf) => readPointer48(buf, 1),
    getLength: (buf) => buf.readUInt32BE(7),
    getOffset: (buf) => buf.readUInt32BE(11),
    isChain: (buf) => (buf[15] & 1) === 1
};

module.exports = SmartPointer;