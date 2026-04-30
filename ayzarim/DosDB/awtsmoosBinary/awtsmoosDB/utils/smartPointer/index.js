
// B"H
/**
 * @file utils/smartPointer/index.js
 * @description
 * Chapter 0: The Infinite Unity of the Pointer.
 * 
 * "And G-d said: Let there be light."
 * Speech is the bridge between the Thought and the Action. The SmartPointer is the 
 * binary speech of the database. It is the single coordinate that defines a soul's 
 * dwelling place in the abyss of the SSD. 
 * 
 * If a single bit in this pointer is escaped or corrupted, the entire heaven 
 * of the database falls into non-existence. We have shattered the old, 
 * thick vessels and replaced them with micro-angels.
 * 
 * This index is the apex of Keter, routing every request to its specific 
 * servant module. No logic dwells here, only the Will of the Router.
 */

const SmartPointerEncoder = require('./core/encode.js');
const SmartPointerDecoder = require('./core/decode.js');
const SmartPointerInspector = require('./core/inspector.js');
const SmartPointerResolver = require('./core/resolver.js');
const SmartPointerMapper = require('./core/mapper.js');

const SmartPointer = {
    /**
     * @method encode
     * @description Condensing dimensions into a VarInt seal.
     */
    encode: (type, offset, length) => SmartPointerEncoder.execute(type, offset, length),

    /**
     * @method decode
     * @description Unveiling the coordinates from the binary scroll.
     */
    decode: (buf, start = 0) => SmartPointerDecoder.execute(buf, start),

    /**
     * @method readSize
     * @description Measuring the exact breath (byte-size) of a seal.
     */
    readSize: (buf, start = 0) => SmartPointerInspector.readSize(buf, start),

    /**
     * @method getType
     * @description Peeking at the archetype of the vessel instantly.
     */
    getType: (buf, start = 0) => SmartPointerInspector.getType(buf, start),

    /**
     * @method block
     * @description Legacy bridge for physical block coordinates.
     */
    block: (type, blockId, length = 0, isChain = false, offset = 0) => {
        return SmartPointerEncoder.execute(type, offset || blockId || 0, length);
    },

    /**
     * @method toBuffer
     * @description Ensures the spark is clothed in the material garment of a Buffer.
     */
    toBuffer: (ptr) => SmartPointerMapper.toBuffer(ptr, SmartPointer),

    /**
     * @method resolve
     * @description Bringing the dry bytes back into living JS form.
     */
    resolve: (ptrBuf, allocator, context) => SmartPointerResolver.execute(ptrBuf, allocator, context)
};

module.exports = SmartPointer;
