
// B"H
/**
 * @file node.js
 * @description
 *  The Scribe of the Sequence Nodes.
 *  
 *  THE TIKKUN OF BALANCE (CHESED & GEVURAH):
 *  Absolute contraction was too harsh. We restore the flow of Chesed.
 *  Sequences (Arrays) once again are created with a foundational padding and 
 *  grow in exponential tiers, preventing Allocator thrashing.
 */
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class SequenceNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
        this.db = allocator.db;
    }

    create(isLeaf, isWeak = false) {
        const initialSize = 128; 
        const ptr = this.allocator.allocate(initialSize);
        const buf = Buffer.allocUnsafe(initialSize).fill(0);
        
        const node = { 
            ptr, buffer: buf, isLeaf, isWeak, 
            itemCount: 0, totalCount: 0, 
            totalBytes: 0
        };
        
        this.db.cacheStructure(ptr, node);
        return node;
    }

    load(ptr) {
        if (!ptr || ptr.blockId === 0) return null;

        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached;
        
        let buf = this.db._readChainSafe({ ...ptr, length: Math.max(ptr.length || 0, 23) });
        if (!buf || buf.length < 23) return null;
        
        const magic = buf.subarray(0, 4).toString();
        if (magic !== constants.MAGIC_SEQ_NODE) return null;

        const flags = buf.readUInt8(4);
        const isLeaf = (flags & 1) === 1;
        const itemCount = buf.readUInt16BE(5);
        
        const itemSize = isLeaf ? 16 : 20;
        const expectedTotalSize = 23 + (itemCount * itemSize);
        
        if (buf.length < expectedTotalSize) {
             buf = this.db._readChainSafe({ ...ptr, length: expectedTotalSize });
        }

        const node = { 
            ptr, buffer: buf, 
            isLeaf,
            isWeak: (flags & 2) === 2, 
            itemCount,
            totalCount: buf.readUInt32BE(7),
            totalBytes: readPointer48(buf, 11)
        };
        
        this.db.cacheStructure(ptr, node);
        return node;
    }

    save(node) {
        if (!node) return null;
        
        const headerSize = 23;
        const itemSize = node.isLeaf ? 16 : 20;
        const requiredSize = headerSize + (node.itemCount * itemSize);
        const physicalCapacity = node.ptr ? (node.ptr.length || 0) : 0;
        
        let allocSize = requiredSize;

        if (physicalCapacity < requiredSize) {
             const oldBuf = node.buffer;
             
             if (allocSize < 128) allocSize = 128;
             else if (allocSize < 512) allocSize = 512;
             else if (allocSize < 1024) allocSize = 1024;
             else allocSize = Math.ceil(allocSize / 1024) * 1024;

             node.ptr = this.allocator.allocate(allocSize);
             
             if (!node.buffer || node.buffer.length < allocSize) {
                 node.buffer = Buffer.allocUnsafe(allocSize).fill(0);
                 if (oldBuf) oldBuf.copy(node.buffer, 0, 0, Math.min(oldBuf.length, requiredSize));
             }
        } else {
             allocSize = physicalCapacity;
        }

        const buf = node.buffer;
        buf.write(constants.MAGIC_SEQ_NODE, 0);
        let flags = node.isLeaf ? 1 : 0;
        if (node.isWeak) flags |= 2;
        
        buf.writeUInt8(flags, 4);
        buf.writeUInt16BE(node.itemCount, 5);
        buf.writeUInt32BE(node.totalCount, 7);
        writePointer48(buf, node.totalBytes, 11);
        
        const dataToWrite = buf.subarray(0, allocSize);
        this.db._writeChainSafe(node.ptr, dataToWrite);
        
        this.db.cacheStructure(node.ptr, node);
        return node.ptr;
    }
}
module.exports = SequenceNode;
