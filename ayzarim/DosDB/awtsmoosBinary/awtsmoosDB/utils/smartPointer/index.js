// B"H
/**
 * @file index.js (SmartPointer)
 * @description 
 *  The Sefirah of Keter (The Crown) — The Absolute Sovereign of Identity.
 * 
 *  In the highest realms of Atziluth, before a value descends into the physical 
 *  stone of the block, it receives its Name and its Nature. This Name is the 
 *  SmartPointer, a 16-byte contraction of infinite potential into defined coordinate.
 * 
 *  Like the Yud in the Name of the Creator, the Pointer is a tiny dot that 
 *  contains the architecture of an entire universe. If the Pointer forgets 
 *  its Type, the Light collapses back into the void. 
 * 
 *  REWRITTEN: Forces authoritative type preservation and provides extreme 
 *  visibility through synchronous binary logging.
 */

const codec = require('./codec.js');
const constants = require('../../constants.js');
const { readPointer48, writePointer48 } = require('../binaryHelpers.js');
const hydrateInlineSync = require('./hydrator_inline_sync.js');
const PayloadBuilder = require('./payload.js');
const fs = require('fs');

/**
 * @function log
 * @description The Voice of the Scribe witnessing the manifestation of the Pointer.
 */
function log(msg) {
    try {
        // Synchronous write to the Second Stream (STDERR) to ensure it is seen.
        fs.writeSync(2, `\x1b[35mB"H [KETER_LOG] ${msg}\x1b[0m\n`);
    } catch(e) {}
}

const SmartPointer = {
    /**
     * @description Encodes raw parameters into a 16-byte physical seal.
     */
    encode(type, mode, payload) { 
        return codec.encode(type, mode, payload); 
    },

    /**
     * @description Decodes a 16-byte seal into its logical components.
     */
    decode(buf) { 
        if (!buf || buf.length !== 16) return null; 
        return codec.decode(buf); 
    },

    /**
     * @description Peeks into the forehead of the seal to see its Type ID.
     */
    getType(buf) { 
        return (buf && buf.length > 0) ? buf[0] & 0x3F : 0; 
    },

    /**
     * @description Creates a Block Pointer: The dwelling place in the physical land.
     */
    block(type, blockId, length = 0, isChain = false, offset = 0) {
        const payload = Buffer.allocUnsafe(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(length, 6);
        payload.writeUInt32BE(offset, 10);
        payload.writeUInt8(isChain ? 1 : 0, 14);
        
        const encoded = this.encode(type, constants.MODE_BLOCK, payload);
        log(`Forging Block Seal: Type=${type}, Block=${blockId}, Off=${offset}, Len=${length} -> Hex: ${encoded.toString('hex')}`);
        return encoded;
    },

    /**
     * @description Creates a Heap Pointer: A micro-vessel within a page.
     */
    heap(type, blockId, offset, length) {
        const payload = Buffer.allocUnsafe(15);
        writePointer48(payload, blockId, 0);
        payload.writeUInt32BE(offset, 6);
        payload.writeUInt32BE(length, 10);
        
        const encoded = this.encode(type, constants.MODE_HEAP, payload);
        log(`Forging Heap Seal: Type=${type}, Block=${blockId}, Off=${offset}, Len=${length} -> Hex: ${encoded.toString('hex')}`);
        return encoded;
    },

    /**
     * @description Converts a JS descriptor object into a definitive 16-byte binary seal.
     * B"H: ENFORCEMENT - This function now guarantees that the 'type' field is 
     * never lost during the transformation from potential (Object) to actual (Buffer).
     */
    toBuffer(ptr) {
        if (!ptr) {
            log("Encountered Void; generating empty seal.");
            return Buffer.alloc(16).fill(0);
        }

        // If it's already a seal, we return it as is.
        if (Buffer.isBuffer(ptr)) {
            if (ptr.length === 16) return ptr;
            log(`Warning: Buffer length ${ptr.length} is not a valid seal.`);
            return Buffer.alloc(16).fill(0);
        }

        if (typeof ptr === 'object') {
            // Determine the nature of the storage mode.
            const mode = ptr.mode !== undefined ? ptr.mode : (ptr.blockId !== undefined ? constants.MODE_BLOCK : constants.MODE_INLINE);
            
            // B"H: THE CRITICAL FIX - We must extract the type authoritatively.
            const type = ptr.type !== undefined ? ptr.type : 0;
            
            log(`Encoding Object to Buffer: Mode=${mode}, Type=${type}, Block=${ptr.blockId || 'N/A'}`);
            
            const payload = PayloadBuilder.createPayload(ptr, mode);
            const encoded = this.encode(type, mode, payload);
            
            log(`Resulting Seal: ${encoded.toString('hex')}`);
            return encoded;
        }

        log(`Error: Input ${typeof ptr} cannot be manifested as a Pointer.`);
        return Buffer.alloc(16).fill(0);
    },

    /**
     * @description Unveils the secret within an Inlined Pointer.
     */
    decodeInline(type, payload, allocator) {
        return hydrateInlineSync(type, payload, allocator);
    },

    /**
     * @description The Eye of Binah — Resolving a binary seal into its living JS soul.
     * B"H: This function determines whether a seal is a primitive spark or a 
     * complex container structure.
     */
    resolve(ptrBuf, allocator) {
        if (!ptrBuf || ptrBuf.length !== 16) {
            return undefined;
        }
        
        const ptr = codec.decode(ptrBuf);
        if (!ptr) {
            log(`Decoding Failed for Seal: ${ptrBuf.toString('hex')}`);
            return undefined;
        }

        const type = ptr.type;
        const mode = ptr.mode;
        
        log(`Resolving Seal: Hex=${ptrBuf.toString('hex')}, Mode=${mode}, Type=${type}`);

        // --- THE REALM OF INLINE (ATZILUTH) ---
        if (mode === constants.MODE_INLINE) {
            const val = hydrateInlineSync(type, ptr.payload, allocator);
            log(`Inlined Value manifested: ${JSON.stringify(val)}`);
            return val;
        }

        // Extract physical coordinates from the payload.
        const blockId = readPointer48(ptr.payload, 0);
        const length = (mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(6) : ptr.payload.readUInt32BE(10);
        const offset = (mode === constants.MODE_BLOCK) ? ptr.payload.readUInt32BE(10) : ptr.payload.readUInt32BE(6);
        const isChain = (mode === constants.MODE_BLOCK) && ptr.payload.readUInt8(14) === 1;

        // B"H: THE FOUR WORLDS OF CONTAINERS
        // We must check the Type ID to see if this block contains a fractal structure.
        const T = constants.VAL_TYPE;
        const isContainer = (
            type === T.SEQUENCE || type === T.MAP || type === T.DICTIONARY ||
            type === T.SET || type === T.OBJECT || type === T.ARRAY || type === T.JSON ||
            // Fallback for constant aliases
            type === 10 || type === 11 || type === 12 || type === 13 || type === 14 || type === 15
        );

        if (mode === constants.MODE_BLOCK && isContainer) {
            log(`CONTAINER IDENTIFIED: Type ${type} at Block ${blockId}. Returning Structure Descriptor.`);
            return { 
                isStructure: true, type: type, blockId, length, offset, isChain, ptr: ptrBuf 
            };
        }

        // --- THE REALM OF PHYSICAL DATA (BERIAH / YETZIRAH / ASIYAH) ---
        // If it's not a container, it's a leaf value (String, Buffer, Number) stored in a block or heap.
        const db = (allocator.v1 ? allocator.v1.db : allocator.db);
        let raw = null;

        if (mode === constants.MODE_HEAP) {
             log(`Reading from Ethereal Heap: Block ${blockId}, Off ${offset}, Len ${length}`);
             let block = allocator.heap ? allocator.heap.readBlock(blockId) : null;
             if (!block) block = (allocator.v1 || allocator).readBlockLocked(blockId, true);
             if (block && offset + length <= block.length) {
                 raw = block.subarray(offset, offset + length);
             }
        } else {
             log(`Reading from Physical Block: Block ${blockId}, Off ${offset}, Len ${length}`);
             raw = require('../../core/db/io.js').readChainSafe(db, { blockId, length, isChain, offset });
        }

        if (!raw) {
            log(`Critical Error: Physical data is missing at block ${blockId}. Pointer Hex: ${ptrBuf.toString('hex')}`);
            return undefined;
        }

        // Final hydration of the raw bytes into a JS value.
        const result = require('./hydrator_value_sync.js')(type, raw, allocator);
        
        // Log the conclusion of the manifestation.
        if (result === undefined) {
            log(`Hydrator returned undefined for Type ${type}. Buffer Len: ${raw.length}`);
        } else {
            const display = Buffer.isBuffer(result) ? `<Buffer ${result.length}>` : JSON.stringify(result).substring(0, 50);
            log(`Value successfully Manifested: ${display}`);
        }

        return result;
    }
};

module.exports = SmartPointer;