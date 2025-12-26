// B"H
const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class MapNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
        this.db = allocator.v1.db; 
    }

    save(node, existingPtr = null) {
        let size = 25 + (node.keys.length * 40); // Estimate
        const raw = Buffer.alloc(size).fill(0);
        let offset = 0;
        
        raw.write(constants.MAGIC_MAP_NODE, offset); offset += 4;
        raw.writeUInt8(node.isLeaf ? 1 : 0, offset++);
        offset += serializer.writeVarIntTo(raw, offset, node.keys.length);
        
        raw.writeUInt32BE(node.totalCount || 0, offset); offset += 4;
        writePointer48(raw, node.totalBytes || 0, offset); offset += 6;
        
        const ptrs = node.isLeaf ? node.values : node.children;
        for (let i = 0; i < node.keys.length; i++) {
            const k = node.keys[i];
            offset += serializer.writeVarIntTo(raw, offset, k.length);
            k.copy(raw, offset); offset += k.length;
            ptrs[i].copy(raw, offset); offset += 16;
        }
        
        if (!node.isLeaf && ptrs.length > node.keys.length) {
            ptrs[ptrs.length - 1].copy(raw, offset); offset += 16;
        }

        const ptr = this.allocator.v1.allocate(offset);
        this.db._writeChainSafe(ptr, raw.subarray(0, offset));
        node.selfPtr = ptr;
        this.db.cacheStructure(ptr.blockId, node);
        return ptr;
    }

    load(ptr) {
        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached;
        
        const block = this.db._readChainSafe(ptr);
        const node = this._parse(block, ptr);
        this.db.cacheStructure(ptr.blockId, node);
        return node;
    }

    _parse(block, ptr) {
        const isLeaf = block[4] === 1;
        const countInfo = serializer.readVarInt(block, 5);
        let offset = 5 + countInfo.bytesRead;
        
        const totalCount = block.readUInt32BE(offset); offset += 4;
        const totalBytes = readPointer48(block, offset); offset += 6;

        const keys = []; const ptrs = [];
        for(let i=0; i<countInfo.value; i++) {
            const lenInfo = serializer.readVarInt(block, offset); offset += lenInfo.bytesRead;
            keys.push(block.subarray(offset, offset + lenInfo.value)); offset += lenInfo.value;
            const p = Buffer.alloc(16); block.copy(p, 0, offset, offset + 16);
            ptrs.push(p); offset += 16;
        }
        
        if (!isLeaf) {
            const lastP = Buffer.alloc(16); block.copy(lastP, 0, offset, offset + 16);
            ptrs.push(lastP);
        }
        
        return { selfPtr: ptr, isLeaf, keys, values: isLeaf ? ptrs : [], children: isLeaf ? [] : ptrs, totalCount, totalBytes };
    }
}
module.exports = MapNode;
