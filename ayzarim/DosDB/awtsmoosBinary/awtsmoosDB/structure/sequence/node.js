
// B"H
/**
 * @file node.js (SequenceNode)
 * @description
 *  =============================================================================
 *  CHAPTER 6: THE TREE OF LIFE (EXACT-BYTE SEQUENCE NODES)
 *  =============================================================================
 *  "The paths of the Lord are straight."
 * 
 *  The Sequence Node has been emancipated from the tyranny of the 16-byte block.
 *  It no longer manipulates raw `node.buffer` arrays in memory. Instead, it 
 *  translates physical bytes into an array of pure Javascript objects:
 *  `node.items = [ { ptr: Buffer, count: Number } ]`.
 *  
 *  When saved, it calculates the exact VarInt size needed and serializes them 
 *  in a continuous, unbroken chain of bytes. Absolutely NO PADDING is tolerated.
 */
const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const SmartPointer = require('../../utils/smartPointer.js');

class SequenceNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
        this.db = allocator.db || (allocator.v1 ? allocator.v1.db : null);
    }

    create(isLeaf, isWeak = false) {
        // We do not allocate disk space until `save()`
        const node = { 
            ptr: null, 
            items: [], // Array of { ptr: Buffer, count: Number }
            isLeaf, 
            isWeak, 
            totalCount: 0, 
            totalBytes: 0
        };
        return node;
    }

    load(ptr) {
        if (!ptr || ptr.offset === undefined) return null;

        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached;
        
        let buf = this.db._readChainSafe(ptr);
        if (!buf || buf.length < 17) return null;
        
        const magic = buf.subarray(0, 4).toString();
        if (magic !== constants.MAGIC_SEQ_NODE) return null;

        const flags = buf.readUInt8(4);
        const isLeaf = (flags & 1) === 1;
        const isWeak = (flags & 2) === 2;
        const itemCount = buf.readUInt16BE(5);
        const totalCount = buf.readUInt32BE(7);
        
        // Read 48-bit totalBytes
        const high = buf.readUInt16BE(11);
        const low = buf.readUInt32BE(13);
        const totalBytes = (high * 0x100000000) + low;
        
        let offset = 17;
        const items = [];
        
        for(let i = 0; i < itemCount; i++) {
            if (offset >= buf.length) break;
            
            // Read dynamic VarInt Pointer
            const pLenInfo = serializer.readVarInt(buf, offset);
            offset += pLenInfo.bytesRead;
            const p = buf.subarray(offset, offset + pLenInfo.value);
            offset += pLenInfo.value;
            
            let count = 1;
            if (!isLeaf) {
                count = buf.readUInt32BE(offset);
                offset += 4;
            }
            
            items.push({ ptr: p, count });
        }

        const node = { ptr, isLeaf, isWeak, items, totalCount, totalBytes };
        this.db.cacheStructure(ptr, node);
        return node;
    }

    save(node) {
        if (!node) return null;
        
        // Header: Magic(4) + flags(1) + itemCount(2) + totalCount(4) + totalBytes(6) = 17 bytes
        let size = 17;
        
        for (const item of node.items) {
            const p = SmartPointer.toBuffer(item.ptr);
            size += serializer.getVarIntSize(p.length) + p.length;
            if (!node.isLeaf) size += 4; // Child element count
        }

        const allocRes = (this.allocator.v1 || this.allocator).allocate(size);
        node.ptr = { offset: allocRes.offset, length: size, type: 15 }; // TYPE_SEQUENCE

        const buf = Buffer.allocUnsafe(size).fill(0);
        buf.write(constants.MAGIC_SEQ_NODE, 0);
        
        let flags = node.isLeaf ? 1 : 0;
        if (node.isWeak) flags |= 2;
        
        buf.writeUInt8(flags, 4);
        buf.writeUInt16BE(node.items.length, 5);
        buf.writeUInt32BE(node.totalCount || 0, 7);
        
        // Write 48-bit totalBytes
        const hBytes = Math.floor((node.totalBytes || 0) / 0x100000000);
        const lBytes = (node.totalBytes || 0) % 0x100000000;
        buf.writeUInt16BE(hBytes, 11);
        buf.writeUInt32BE(lBytes, 13);
        
        let offset = 17;
        for (const item of node.items) {
            const p = SmartPointer.toBuffer(item.ptr);
            offset += serializer.writeVarIntTo(buf, offset, p.length);
            p.copy(buf, offset); 
            offset += p.length;
            
            if (!node.isLeaf) {
                buf.writeUInt32BE(item.count, offset);
                offset += 4;
            }
        }
        
        this.db._writeChainSafe(node.ptr, buf);
        this.db.cacheStructure(node.ptr, node);
        return node.ptr;
    }
}
module.exports = SequenceNode;
