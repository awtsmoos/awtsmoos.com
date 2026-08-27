
// B"H
/**
 * @file storage.js
 * @class VectorStorage
 * @description 
 *  =============================================================================
 *  CHAPTER 21: THE SCRIBE OF SPATIAL MEMORY
 *  =============================================================================
 *  "He stretches out the north over the void, and hangs the earth upon nothing." (Job 26:7)
 * 
 *  In the realm of Vector Geometry, thoughts are plotted as coordinates in high-dimensional 
 *  space. To make these coordinates eternal, they must be crystallized into physical 
 *  blocks on the disk. 
 * 
 *  This `VectorStorage` module performs the holy act of Serialization. It takes the 
 *  living HNSW (Hierarchical Navigable Small World) nodes, calculates the exact 
 *  breath (bytes) required to contain their floats and connections, and seals them 
 *  into binary. 
 * 
 *  THE TIKKUN: Previously, the scribe sought empty space by addressing the abstract 
 *  V2 Allocator, which possesses no direct `allocate` command. It now correctly 
 *  beseeches the `v1` foundation, ensuring the space is granted and the vectors 
 *  are etched into the physical world.
 */

const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartPointer = require('../../utils/smartPointer.js');
const serializer = require('../../utils/serializer.js');

const MAGIC_VEC = "VN01";

class VectorStorage {
    /**
     * @constructor
     * @param {Object} allocator - The Master Builder of Reality (AllocatorV2).
     */
    constructor(allocator) {
        this.allocator = allocator;
        // B"H: The Tikkun. We must access the v1 physical kernel for raw allocations.
        this.v1 = allocator.v1 || allocator;
        this.db = allocator.db || this.v1.db;
    }

    /**
     * @method saveNode
     * @description 
     *  Contracts a multi-dimensional spatial node into a flat binary sequence.
     *  It seals the magic, the flags, the mathematical vectors, and the neighborhood 
     *  links into a single buffer, then requests space from the V1 Allocator.
     * 
     * @param {Object} node The HNSW living node.
     * @returns {Buffer} The VarInt SmartPointer anchor.
     */
    saveNode(node) {
        const vecSize = node.vector.length * 4;
        const payloadLen = node.payloadPtr ? node.payloadPtr.length : 0;
        const pLenSize = serializer.getVarIntSize(payloadLen);
        
        let size = 14 + pLenSize + payloadLen + vecSize; 
        
        for(let i = 0; i <= node.level; i++) {
            size += 2; 
            size += (node.neighbors[i] || []).length * 4; 
        }
        
        const buf = Buffer.allocUnsafe(size);
        let off = 0;
        
        buf.write(MAGIC_VEC, off); off += 4;
        buf.writeUInt8(node.deleted ? 1 : 0, off++);
        buf.writeUInt8(node.level, off++);
        buf.writeUInt32BE(vecSize, off); off += 4;
        
        const floatView = new Uint8Array(node.vector.buffer);
        buf.set(floatView, off); off += vecSize;
        
        off += serializer.writeVarIntTo(buf, off, payloadLen);
        if (payloadLen > 0) {
            node.payloadPtr.copy(buf, off); off += payloadLen;
        }
        
        buf.writeUInt32BE(node.id, off); off += 4;
        
        for(let i = 0; i <= node.level; i++) {
            const nb = node.neighbors[i] || [];
            buf.writeUInt16BE(nb.length, off); off += 2;
            for(const nId of nb) {
                buf.writeUInt32BE(nId, off); off += 4;
            }
        }
        
        const ptr = this.v1.allocate(size); 
        this.db._writeChainSafe(ptr, buf);
        
        return SmartPointer.block(constants.TYPE_CUSTOM_INSTANCE, ptr.blockId, ptr.length, !!ptr.isChain, ptr.offset);
    }

    /**
     * @method loadNode
     * @description 
     *  Resurrects a spatial node from its dormant binary state.
     *  Reads the magic seal, rehydrates the Float32Array, and restores its connections.
     * 
     * @param {Buffer} ptrBuf The VarInt SmartPointer anchor.
     * @returns {Object|null} The living HNSW node, or null if the void is empty.
     */
    loadNode(ptrBuf) {
        const decoded = SmartPointer.decode(ptrBuf);
        if (!decoded) return null;

        const buf = this.db._readChainSafe(decoded);
        
        if (!buf || buf.length < 14) return null;
        if (buf.subarray(0, 4).toString() !== MAGIC_VEC) return null;
        
        let off = 4;
        const deleted = buf.readUInt8(off++) === 1;
        const level = buf.readUInt8(off++);
        const vecLen = buf.readUInt32BE(off); off += 4;
        
        const vecBuf = buf.subarray(off, off + vecLen);
        const vector = new Float32Array(vecBuf.length / 4);
        Buffer.from(vector.buffer).set(vecBuf);
        off += vecLen;
        
        const pLenInfo = serializer.readVarInt(buf, off);
        off += pLenInfo.bytesRead;
        
        let payloadPtr = null;
        if (pLenInfo.value > 0) {
            payloadPtr = Buffer.allocUnsafe(pLenInfo.value);
            buf.copy(payloadPtr, 0, off, off + pLenInfo.value);
            off += pLenInfo.value;
        } else {
            payloadPtr = Buffer.alloc(0);
        }
        
        const id = buf.readUInt32BE(off); off += 4;
        
        const neighbors = [];
        for(let i = 0; i <= level; i++) {
            if (off >= buf.length) break;
            const count = buf.readUInt16BE(off); off += 2;
            const nb = [];
            for(let j = 0; j < count; j++) {
                nb.push(buf.readUInt32BE(off)); off += 4;
            }
            neighbors.push(nb);
        }
        
        return { id, level, vector, payloadPtr, neighbors, deleted, ptr: ptrBuf };
    }
}

module.exports = VectorStorage;
