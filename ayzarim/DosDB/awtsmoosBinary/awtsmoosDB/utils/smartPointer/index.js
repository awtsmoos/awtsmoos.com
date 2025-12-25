// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Keter - The Absolute Source.
 *  Aggregates the modularized pointer logic into a single unified class.
 *  Exports early to solve circular dependency klipah.
 */

const codec = require('./codec.js');
const constants = require('../../constants.js');
const { writePointer48 } = require('../binaryHelpers.js');

class SmartPointer {
    static encode(type, mode, payload) { return codec.encode(type, mode, payload); }
    static decode(buf) { return codec.decode(buf); }

    // Bitwise Access
    static getMode(buf) { return codec.getMode(buf); }
    static getType(buf) { return codec.getType(buf); }
    static getBlockId(buf) { return codec.getBlockId(buf); }
    static getLength(buf) { return codec.getLength(buf); }
    static getOffset(buf) { return codec.getOffset(buf); }
    static isChain(buf) { return codec.isChain(buf); }

    // Factory Methods
    static inline(type, dataBuffer) { return codec.encode(type, constants.MODE_INLINE, dataBuffer); }

    static heap(type, blockId, offset, length) {
        const payload = Buffer.allocUnsafe(14); 
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(offset, 6);
        payload.writeUInt32BE(length, 10);
        return codec.encode(type, constants.MODE_HEAP, payload);
    }

    static block(type, blockId, length = 0, isChain = false, offset = 0) {
        const payload = Buffer.allocUnsafe(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(length, 6);
        payload.writeUInt32BE(offset, 10);
        payload.writeUInt8(isChain ? 1 : 0, 14);
        return codec.encode(type, constants.MODE_BLOCK, payload);
    }

    // Hydration - Uses late-bound hydrator to break circular requirements
    /**
     * @description Resolves a 16-byte pointer into its living JS form.
     */
    static async resolve(ptrBuf, allocator, context) {
        const hydrator = require('./hydrator.js');
        return await hydrator.resolve(ptrBuf, allocator, context, SmartPointer);
    }

    /**
     * @description Decodes raw data from an inline pointer.
     */
    static async decodeInline(type, payload, allocator, context) {
        const hydrator = require('./hydrator.js');
        return await hydrator.decodeInline(type, payload, allocator, context, SmartPointer);
    }

    /**
     * @description Decodes raw buffer data based on a given type.
     */
    static async decodeValue(type, buffer, allocator, context, ctxKey) {
        const hydrator = require('./hydrator.js');
        return await hydrator.decodeValue(type, buffer, allocator, context, ctxKey, SmartPointer);
    }
}

// B"H: Export early so required modules get the full class definition
module.exports = SmartPointer;