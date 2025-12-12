
// B"H
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartPointer = require('../../utils/smartPointer.js');

const MAGIC_VEC_NODE = "VNOD";

// B"H: Constants from HNSW to calculate max size
const M = 12; 
const M_MAX0 = 24; 

class VectorStorage {
    constructor(allocator) {
        this.allocator = allocator;
    }

    _calculateMaxSize(vecLen, level) {
        // Header: 4(Magic) + 1(Flags) + 1(Level) + 4(VecLen) + 16(Payload) + 4(ID) = 30 bytes
        // Vector: vecLen bytes
        // Neighbors: 
        //   Level 0: 2(Count) + M_MAX0 * 4
        //   Level >0: 2(Count) + M * 4
        
        const headerSize = 30;
        const vecSize = vecLen;
        let neighborSize = 0;
        
        for(let l=0; l<=level; l++) {
            const maxNeighbors = (l === 0) ? M_MAX0 : M;
            neighborSize += 2 + (maxNeighbors * 4);
        }
        
        return headerSize + vecSize + neighborSize;
    }

    async createNode(vector, level, payloadPtr, nodeId) {
        const floatArr = new Float32Array(vector);
        const vecBuffer = Buffer.from(floatArr.buffer);
        
        // B"H: Allocate Max Capacity upfront to avoid moving the node later
        const totalSize = this._calculateMaxSize(vecBuffer.length, level);
        
        const buffer = Buffer.alloc(totalSize); // Zero-filled by default
        let offset = 0;
        
        buffer.write(MAGIC_VEC_NODE, offset); offset += 4;
        buffer.writeUInt8(0, offset); offset += 1; // Flags (Alive)
        buffer.writeUInt8(level, offset); offset += 1;
        buffer.writeUInt32BE(vecBuffer.length, offset); offset += 4;
        
        vecBuffer.copy(buffer, offset); offset += vecBuffer.length;
        if (payloadPtr) payloadPtr.copy(buffer, offset);
        offset += 16;

        buffer.writeUInt32BE(nodeId, offset); offset += 4;
        
        // Initialize neighbor counts to 0 (Buffer is zero-filled, but let's be explicit for headers)
        // We just leave the space empty. saveNode will fill it.
        
        const ptr = await this.allocator.v1.allocate(totalSize);
        await this.allocator.v1.db._writeChainSafe(ptr, buffer);
        
        // Return pointer with IS_STATIC flag implicitly (by not changing it later)
        return SmartPointer.block(constants.TYPE_CUSTOM_INSTANCE, ptr.blockId, totalSize, ptr.isChain, ptr.offset);
    }

    async loadNode(ptrBuf) {
        const ptr = SmartPointer.decode(ptrBuf);
        const blockId = readPointer48(ptr.payload, 0);
        const length = ptr.payload.readUInt32BE(6);
        const offsetVal = ptr.payload.readUInt32BE(10);
        const isChain = ptr.payload.readUInt8(14) === 1;

        const buffer = await this.allocator.v1.db._readChainSafe({ blockId, length, isChain, offset: offsetVal });
        let offset = 0;
        
        // Safety check
        if (buffer.length < 4) throw new Error(`Invalid Node Buffer (Len ${buffer.length})`);
        
        if (buffer.toString('utf8', 0, 4) !== MAGIC_VEC_NODE) {
             // If zeroed, it might be corruption or empty alloc.
             throw new Error("Invalid Vector Node Magic");
        }
        offset += 4;
        
        const flags = buffer.readUInt8(offset); offset += 1;
        const deleted = (flags & 1) === 1;
        const level = buffer.readUInt8(offset); offset += 1;
        const vecLen = buffer.readUInt32BE(offset); offset += 4;
        
        const vecBuf = buffer.subarray(offset, offset + vecLen);
        
        const alignedVec = Buffer.alloc(vecLen);
        vecBuf.copy(alignedVec);
        const vector = new Float32Array(alignedVec.buffer, alignedVec.byteOffset, alignedVec.byteLength / 4);
        offset += vecLen;
        
        const payloadPtr = buffer.subarray(offset, offset + 16);
        offset += 16;
        const id = buffer.readUInt32BE(offset); offset += 4;
        
        const neighbors = []; 
        for(let i=0; i<=level; i++) {
            if (offset + 2 > buffer.length) break;
            const count = buffer.readUInt16BE(offset); offset += 2;
            const levelNeighbors = [];
            for(let j=0; j<count; j++) {
                if (offset + 4 > buffer.length) break;
                levelNeighbors.push(buffer.readUInt32BE(offset));
                offset += 4;
            }
            // Skip remaining capacity for this level to find next level
            const maxNeighbors = (i === 0) ? M_MAX0 : M;
            const remaining = maxNeighbors - count;
            offset += (remaining * 4);
            
            neighbors.push(levelNeighbors);
        }

        return { id, ptr: ptrBuf, level, vector, payloadPtr, neighbors, deleted };
    }

    async saveNode(nodeData) {
        const vecBuffer = Buffer.from(nodeData.vector.buffer);
        
        // We reconstruct the buffer. 
        // B"H: IMPORTANT - We must preserve the TOTAL allocated size, not just used size.
        // We use the pointer's length to know the allocated size.
        
        const ptrInfo = SmartPointer.decode(nodeData.ptr);
        const totalAllocatedSize = ptrInfo.payload.readUInt32BE(6);
        
        const buffer = Buffer.alloc(totalAllocatedSize);
        
        let offset = 0;
        buffer.write(MAGIC_VEC_NODE, offset); offset += 4;
        buffer.writeUInt8(nodeData.deleted ? 1 : 0, offset); offset += 1; 
        buffer.writeUInt8(nodeData.level, offset); offset += 1;
        buffer.writeUInt32BE(vecBuffer.length, offset); offset += 4;
        vecBuffer.copy(buffer, offset); offset += vecBuffer.length;
        nodeData.payloadPtr.copy(buffer, offset); offset += 16;
        buffer.writeUInt32BE(nodeData.id, offset); offset += 4;
        
        for(let i=0; i<=nodeData.level; i++) {
            const list = nodeData.neighbors[i] || [];
            buffer.writeUInt16BE(list.length, offset); offset += 2;
            for(const nId of list) { 
                buffer.writeUInt32BE(nId, offset); offset += 4; 
            }
            // Pad remainder
            const maxNeighbors = (i === 0) ? M_MAX0 : M;
            const remaining = maxNeighbors - list.length;
            offset += (remaining * 4);
        }

        // B"H: IN-PLACE WRITE
        // We do not free/allocate. We write back to the existing location.
        const blockId = readPointer48(ptrInfo.payload, 0);
        const offVal = ptrInfo.payload.readUInt32BE(10);
        const isChain = ptrInfo.payload.readUInt8(14) === 1;
        
        const writePtr = { blockId, offset: offVal, length: totalAllocatedSize, isChain };
        await this.allocator.v1.db._writeChainSafe(writePtr, buffer);
        
        // Return the SAME pointer. 
        // HNSW will detect this and skip registry update.
        return nodeData.ptr;
    }
}
module.exports = VectorStorage;
