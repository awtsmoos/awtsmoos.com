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

    async save(node, existingPtr = null) {
        // B"H: Optimization - Calculate Exact Size First
        // Header: Magic(4) + Flags(1) + Count(VarInt) + Stats(10)
        let size = 4 + 1 + serializer.getVarIntSize(node.keys.length) + 10;
        
        // Keys
        for (const k of node.keys) {
            if (Buffer.isBuffer(k)) {
                size += serializer.getVarIntSize(k.length) + k.length;
            } else {
                size += Buffer.byteLength(String(k), 'utf8');
                size += serializer.getVarIntSize(Buffer.byteLength(String(k), 'utf8')); // Length prefix
            }
        }
        
        // Pointers (16 bytes each)
        const ptrs = node.isLeaf ? node.values : node.children;
        size += ptrs.length * 16;
        
        // Next Ptr
        size += 6;

        // Allocate Single Buffer
        const raw = Buffer.allocUnsafe(size);
        let offset = 0;
        
        // Write Header
        offset += raw.write(constants.MAGIC_MAP_NODE, offset);
        raw.writeUInt8(node.isLeaf ? 1 : 0, offset++);
        offset += serializer.writeVarIntTo(raw, offset, node.keys.length);
        
        raw.writeUInt32BE(node.totalCount || 0, offset); offset += 4;
        writePointer48(raw, node.totalBytes || 0, offset); offset += 6;
        
        // Write Keys
        for (const k of node.keys) {
            if (Buffer.isBuffer(k)) {
                offset += serializer.writeVarIntTo(raw, offset, k.length);
                k.copy(raw, offset);
                offset += k.length;
            } else {
                offset += serializer.writeStringTo(raw, offset, String(k));
            }
        }
        
        // Write Pointers
        for (const p of ptrs) {
            p.copy(raw, offset);
            offset += 16;
        }
        
        // Write Next
        writePointer48(raw, node.next || 0, offset);
        offset += 6;

        let ptr;
        
        if (existingPtr && existingPtr.blockId) {
            if (existingPtr.length === raw.length) {
                 await this.allocator.v1.db._writeChainSafe(existingPtr, raw);
                 ptr = existingPtr;
            } else {
                 // Relocation: Clear old cache entry
                 this.db.evictStructure(existingPtr);
                 await this.allocator.v1.free(existingPtr);
                 ptr = await this.allocator.v1.allocate(raw.length);
                 await this.allocator.v1.db._writeChainSafe(ptr, raw);
            }
        } else {
            ptr = await this.allocator.v1.allocate(raw.length);
            await this.allocator.v1.db._writeChainSafe(ptr, raw);
        }
        
        const finalPtr = {
            blockId: ptr.blockId,
            length: ptr.length,
            offset: ptr.offset || 0,
            isChain: ptr.isChain
        };
        
        node.selfPtr = finalPtr;
        this.db.cacheStructure(finalPtr, node);
        
        return finalPtr;
    }

    async load(ptr) {
        if (!ptr || !ptr.blockId) throw new Error("B\"H: MapNode Load Failed - Null Pointer");
        
        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached; 
        
        let block;
        if (ptr.isChain) {
            block = await this.allocator.v1.db._readChainSafe(ptr);
        } else {
            block = await this.allocator.v1.readBlockLocked(ptr.blockId, false); 
            if (ptr.offset) block = block.subarray(ptr.offset, ptr.offset + ptr.length);
        }
        
        if (!block) throw new Error(`B"H: MapNode Load Failed - Block ${ptr.blockId} Empty`);

        try {
            const node = this._parse(block, ptr);
            this.db.cacheStructure(ptr, node);
            return node;
        } catch (e) {
            if (e.message.startsWith("B\"H MapNode Corruption") && ptr.length < constants.BLOCK_SIZE && !ptr.isChain) {
                const fullPtr = { ...ptr, length: constants.BLOCK_SIZE };
                const fullBlock = await this.allocator.v1.db._readChainSafe(fullPtr);
                const node = this._parse(fullBlock, ptr);
                this.db.cacheStructure(ptr, node);
                return node;
            }
            throw e;
        }
    }

    _parse(block, ptr) {
        const magic = block.toString('utf8', 0, 4);
        if (magic !== constants.MAGIC_MAP_NODE) {
             return { selfPtr: ptr, isLeaf: true, keys: [], values: [], children: [], totalCount: 0, totalBytes: 0, next: 0 };
        }

        let offset = 4;
        const isLeaf = block[offset] === 1; offset++;
        
        let count = 0;
        let shift = 0;
        while (true) {
            const b = block[offset++];
            count |= (b & 0x7F) << shift;
            if ((b & 0x80) === 0) break;
            shift += 7;
        }
        
        const totalCount = block.readUInt32BE(offset);
        const totalBytes = readPointer48(block, offset + 4); offset += 10;

        const keys = new Array(count);
        for(let i=0; i<count; i++) {
            if (offset >= block.length) break;
            let len = 0;
            let s = 0;
            while (true) {
                const b = block[offset++];
                len |= (b & 0x7F) << s;
                if ((b & 0x80) === 0) break;
                s += 7;
            }
            const k = block.subarray(offset, offset + len);
            keys[i] = k;
            offset += len;
        }
        
        const ptrCount = isLeaf ? count : count + 1;
        const requiredSpace = ptrCount * 16;
        if (offset + requiredSpace > block.length) {
             if (count > 0) throw new Error(`B"H MapNode Corruption at B${ptr.blockId}`);
             return { selfPtr: ptr, isLeaf, keys, values: [], children: [], totalCount, totalBytes, next: 0 };
        }

        const ptrs = new Array(ptrCount);
        for(let i=0; i<ptrCount; i++) { 
            const p = Buffer.allocUnsafe(16);
            block.copy(p, 0, offset, offset + 16);
            ptrs[i] = p; 
            offset += 16; 
        }
        
        let next = 0;
        if (offset + 6 <= block.length) next = readPointer48(block, offset);
        
        return { selfPtr: ptr, isLeaf, keys, values: isLeaf ? ptrs : [], children: isLeaf ? [] : ptrs, totalCount, totalBytes, next };
    }
}
module.exports = MapNode;