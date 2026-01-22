// B"H
/**
 * @file storage.js
 * @description Synchronous Serialization of Vector Nodes.
 */
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartPointer = require('../../utils/smartPointer.js');

const MAGIC_VEC = "VN01";
const M_MAX0 = 24;
const M = 12;

class VectorStorage {
    constructor(allocator) {
        this.allocator = allocator;
    }

    saveNode(node) {
        // Calculate size
        // Magic(4) + Flags(1) + Level(1) + VecLen(4) + Vector(N*4) + Payload(16) + ID(4) + Neighbors...
        const vecSize = node.vector.length * 4;
        let size = 30 + vecSize; 
        
        for(let i=0; i<=node.level; i++) {
            size += 2; // Count
            size += (node.neighbors[i] || []).length * 4; // IDs
        }
        
        // Pad for max growth or reallocate?
        // Simple: Just allocate exact needed now. If it grows, pointer updates.
        
        const buf = Buffer.allocUnsafe(size);
        let off = 0;
        buf.write(MAGIC_VEC, off); off += 4;
        buf.writeUInt8(node.deleted ? 1 : 0, off++);
        buf.writeUInt8(node.level, off++);
        buf.writeUInt32BE(vecSize, off); off += 4;
        
        const floatView = new Uint8Array(node.vector.buffer);
        buf.set(floatView, off); off += vecSize;
        
        node.payloadPtr.copy(buf, off); off += 16;
        buf.writeUInt32BE(node.id, off); off += 4;
        
        for(let i=0; i<=node.level; i++) {
            const nb = node.neighbors[i] || [];
            buf.writeUInt16BE(nb.length, off); off += 2;
            for(const nId of nb) {
                buf.writeUInt32BE(nId, off); off += 4;
            }
        }
        
        // Save using allocator synchronously
        const ptr = this.allocator.allocate(size); // allocate returns {blockId...}
        // Write data
        this.allocator.db._writeChainSafe(ptr, buf);
        
        return SmartPointer.block(constants.TYPE_CUSTOM_INSTANCE, ptr.blockId, ptr.length, ptr.isChain, ptr.offset);
    }

    loadNode(ptrBuf) {
        const decoded = SmartPointer.decode(ptrBuf);
        // Sync Read
        const buf = this.allocator.db._readChainSafe({
            blockId: readPointer48(decoded.payload, 0),
            length: decoded.payload.readUInt32BE(6),
            offset: decoded.payload.readUInt32BE(10),
            isChain: decoded.payload.readUInt8(14) === 1
        });
        
        if (!buf || buf.length < 30) return null;
        if (buf.subarray(0, 4).toString() !== MAGIC_VEC) return null;
        
        let off = 4;
        const deleted = buf.readUInt8(off++) === 1;
        const level = buf.readUInt8(off++);
        const vecLen = buf.readUInt32BE(off); off += 4;
        
        const vecBuf = buf.subarray(off, off + vecLen);
        // Create TypedArray copy
        const vector = new Float32Array(vecBuf.length / 4);
        Buffer.from(vector.buffer).set(vecBuf);
        off += vecLen;
        
        const payloadPtr = Buffer.allocUnsafe(16);
        buf.copy(payloadPtr, 0, off, off + 16); off += 16;
        
        const id = buf.readUInt32BE(off); off += 4;
        
        const neighbors = [];
        for(let i=0; i<=level; i++) {
            if (off >= buf.length) break;
            const count = buf.readUInt16BE(off); off += 2;
            const nb = [];
            for(let j=0; j<count; j++) {
                nb.push(buf.readUInt32BE(off)); off += 4;
            }
            neighbors.push(nb);
        }
        
        return { id, level, vector, payloadPtr, neighbors, deleted, ptr: ptrBuf };
    }
}

module.exports = VectorStorage;