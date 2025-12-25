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
        
        // B"H: Safer Allocation Strategy
        // To avoid potential corruption where trailing data from a larger previous block
        // confuses the parser (if the new data is smaller), we ALWAYS allocate fresh 
        // if the size is different, or force a clean write.
        
        if (existingPtr && existingPtr.blockId) {
            if (existingPtr.length === raw.length) {
                 // Perfect fit, reuse
                 await this.allocator.v1.db._writeChainSafe(existingPtr, raw);
                 ptr = existingPtr;
            } else {
                 // Size changed. Free and re-alloc to be safe.
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
        
        // Ensure cache points to this object
        this.db.cacheStructure(finalPtr.blockId, node);
        
        return finalPtr;
    }

    async load(ptr) {
        if (!ptr || !ptr.blockId) throw new Error("B\"H: MapNode Load Failed - Null Pointer");
        
        const cached = this.db.getCachedStructure(ptr);
        if (cached) {
            return cached; 
        }
        
        let block;
        if (ptr.isChain) {
            block = await this.allocator.v1.db._readChainSafe(ptr);
        } else {
            // B"H: CRITICAL FIX - Must set noCopy=false to ensure we own the buffer.
            block = await this.allocator.v1.readBlockLocked(ptr.blockId, false); 
            
            // If offset is used, slice it based on expected length.
            // WARNING: If ptr.length is stale (smaller than actual data), this slice truncates data.
            if (ptr.offset !== undefined) block = block.subarray(ptr.offset, ptr.offset + ptr.length);
        }
        
        if (!block) throw new Error(`B"H: MapNode Load Failed - Block ${ptr.blockId} Empty`);

        try {
            const node = this._parse(block, ptr);
            this.db.cacheStructure(ptr.blockId, node);
            return node;
        } catch (e) {
            // B"H: Auto-Healing for Stale Length / Corruption
            // If we hit RangeError (stale length) or Corruption, AND it's a standard block node,
            // retry by reading the FULL block to see if valid data exists beyond the stale length.
            const isRangeError = e instanceof RangeError || e.code === 'ERR_OUT_OF_RANGE';
            const isCorruption = e.message.startsWith("B\"H MapNode Corruption");
            
            if ((isRangeError || isCorruption) && !ptr.isChain) {
                if (this.db.debug) console.warn(`B"H [Healing] Retrying MapNode B${ptr.blockId} with full block read... (${e.message})`);
                
                // Read full 4KB block without slicing by ptr.length
                const fullBlock = await this.allocator.v1.readBlockLocked(ptr.blockId, false);
                
                // Apply offset only (assume length extends to end of block)
                const offset = ptr.offset || 0;
                const safeBlock = fullBlock.subarray(offset); 
                
                try {
                    const node = this._parse(safeBlock, ptr);
                    // Update cache. Note: The pointer in node.selfPtr might still report old length until next save.
                    this.db.cacheStructure(ptr.blockId, node);
                    return node;
                } catch (e2) {
                    throw e; // Original error (or new one) if healing failed
                }
            }
            throw e;
        }
    }

    _parse(block, ptr) {
        // B"H: Optimized parser to minimize object allocation
        const magic = block.toString('utf8', 0, 4);
        if (magic !== constants.MAGIC_MAP_NODE) {
             return { selfPtr: ptr, isLeaf: true, keys: [], values: [], children: [], totalCount: 0, totalBytes: 0, next: 0 };
        }

        let offset = 4;
        const isLeaf = block[offset] === 1; offset++;
        
        // Read VarInt Inline
        let count = 0;
        let shift = 0;
        while (true) {
            if (offset >= block.length) throw new Error(`B"H MapNode Corruption (Header Truncated) at B${ptr.blockId}`);
            const b = block[offset++];
            count |= (b & 0x7F) << shift;
            if ((b & 0x80) === 0) break;
            shift += 7;
        }
        
        if (offset + 10 > block.length) throw new Error(`B"H MapNode Corruption (Stats Truncated) at B${ptr.blockId}`);

        const totalCount = block.readUInt32BE(offset);
        const totalBytes = readPointer48(block, offset + 4); offset += 10;

        const keys = new Array(count);
        for(let i=0; i<count; i++) {
            if (offset >= block.length) break;
            
            // Read Buffer VarInt Inline
            let len = 0;
            let s = 0;
            while (true) {
                if (offset >= block.length) throw new Error(`B"H MapNode Corruption (KeyLen Truncated) at B${ptr.blockId}`);
                const b = block[offset++];
                len |= (b & 0x7F) << s;
                if ((b & 0x80) === 0) break;
                s += 7;
            }
            
            if (offset + len > block.length) throw new Error(`B"H MapNode Corruption (Key Data Truncated) at B${ptr.blockId}`);

            const k = block.subarray(offset, offset + len);
            keys[i] = k;
            offset += len;
        }
        
        const ptrCount = isLeaf ? count : count + 1;
        const requiredSpace = ptrCount * 16;
        
        // B"H: Strict check before loop
        if (offset + requiredSpace > block.length) {
             throw new Error(`B"H MapNode Corruption (Pointers Truncated) at B${ptr.blockId} (Needed ${offset+requiredSpace}, Got ${block.length})`);
        }

        const ptrs = new Array(ptrCount);
        for(let i=0; i<ptrCount; i++) { 
            const p = Buffer.allocUnsafe(16);
            block.copy(p, 0, offset, offset + 16);
            ptrs[i] = p; 
            offset += 16; 
        }
        
        let next = 0;
        if (offset + 6 <= block.length) {
            next = readPointer48(block, offset);
        }
        
        return { selfPtr: ptr, isLeaf, keys, values: isLeaf ? ptrs : [], children: isLeaf ? [] : ptrs, totalCount, totalBytes, next };
    }
}
module.exports = MapNode;