
// B"H
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartPointer = require('../../utils/smartPointer.js');

const MAGIC_VEC_NODE = "VNOD";

class VectorStorage {
    constructor(allocator) {
        this.allocator = allocator;
    }

    async createNode(vector, level, payloadPtr, nodeId) {
        const floatArr = new Float32Array(vector);
        const vecBuffer = Buffer.from(floatArr.buffer);
        const headerSize = 4 + 1 + 1 + 4 + 16 + 4;
        const bodySize = vecBuffer.length;
        const neighborMetaSize = (level + 1) * 2; 
        const totalSize = headerSize + bodySize + neighborMetaSize;
        
        const buffer = Buffer.alloc(totalSize);
        let offset = 0;
        
        buffer.write(MAGIC_VEC_NODE, offset); offset += 4;
        buffer.writeUInt8(0, offset); offset += 1;
        buffer.writeUInt8(level, offset); offset += 1;
        buffer.writeUInt32BE(vecBuffer.length, offset); offset += 4;
        
        vecBuffer.copy(buffer, offset); offset += vecBuffer.length;
        if (payloadPtr) payloadPtr.copy(buffer, offset);
        offset += 16;

        buffer.writeUInt32BE(nodeId, offset); offset += 4;
        for(let i=0; i<=level; i++) {
            buffer.writeUInt16BE(0, offset); offset += 2;
        }

        const ptr = await this.allocator.v1.allocate(totalSize);
        await this.allocator.v1.db._writeChainSafe(ptr, buffer);
        
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
        if (buffer.toString('utf8', 0, 4) !== MAGIC_VEC_NODE) throw new Error("Invalid Vector Node");
        offset += 4;
        
        const flags = buffer.readUInt8(offset); offset += 1;
        const deleted = (flags & 1) === 1;
        const level = buffer.readUInt8(offset); offset += 1;
        const vecLen = buffer.readUInt32BE(offset); offset += 4;
        
        const vecBuf = buffer.subarray(offset, offset + vecLen);
        
        // B"H: FIX ALIGNMENT. 
        // The Header is 10 bytes (4+1+1+4), so vecBuf starts at offset 10.
        // Float32Array requires byteOffset % 4 === 0. 10 % 4 !== 0.
        // We must copy to a new aligned buffer.
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
            neighbors.push(levelNeighbors);
        }

        return { id, ptr: ptrBuf, level, vector, payloadPtr, neighbors, deleted };
    }

    async saveNode(nodeData) {
        const vecBuffer = Buffer.from(nodeData.vector.buffer);
        let neighborSize = 0;
        for(let i=0; i<=nodeData.level; i++) {
            neighborSize += 2; 
            neighborSize += (nodeData.neighbors[i] ? nodeData.neighbors[i].length * 4 : 0);
        }
        
        const totalSize = 4 + 1 + 1 + 4 + 16 + 4 + vecBuffer.length + neighborSize;
        const buffer = Buffer.alloc(totalSize);
        
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
            for(const nId of list) { buffer.writeUInt32BE(nId, offset); offset += 4; }
        }

        const oldPtrStruct = SmartPointer.decode(nodeData.ptr);
        const oldBlockId = readPointer48(oldPtrStruct.payload, 0);
        const oldLen = oldPtrStruct.payload.readUInt32BE(6);
        const oldOff = oldPtrStruct.payload.readUInt32BE(10);
        const oldIsChain = oldPtrStruct.payload.readUInt8(14) === 1;
        
        await this.allocator.v1.free({ blockId: oldBlockId, length: oldLen, isChain: oldIsChain, offset: oldOff });
        const newAlloc = await this.allocator.v1.allocate(totalSize);
        await this.allocator.v1.db._writeChainSafe(newAlloc, buffer);
        
        return SmartPointer.block(constants.TYPE_CUSTOM_INSTANCE, newAlloc.blockId, totalSize, newAlloc.isChain, newAlloc.offset);
    }
}
module.exports = VectorStorage;
