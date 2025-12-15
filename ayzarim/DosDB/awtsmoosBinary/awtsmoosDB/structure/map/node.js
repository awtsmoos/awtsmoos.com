
// B"H
const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class MapNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
    }

    async save(node, existingPtr = null) {
        const parts = [];
        parts.push(Buffer.from(constants.MAGIC_MAP_NODE));
        parts.push(Buffer.from([node.isLeaf ? 1 : 0]));
        parts.push(serializer.writeVarInt(node.keys.length));
        
        const statsBuf = Buffer.alloc(10);
        statsBuf.writeUInt32BE(node.totalCount || 0, 0);
        writePointer48(statsBuf, node.totalBytes || 0, 4);
        parts.push(statsBuf);
        
        for (const k of node.keys) {
            // B"H: Handle Buffer keys efficiently
            if (Buffer.isBuffer(k)) {
                parts.push(serializer.writeVarInt(k.length));
                parts.push(k);
            } else {
                parts.push(serializer.writeString(String(k)));
            }
        }
        
        const ptrs = node.isLeaf ? node.values : node.children;
        for (const p of ptrs) parts.push(p);

        const nextBuf = Buffer.alloc(6);
        writePointer48(nextBuf, node.next || 0, 0);
        parts.push(nextBuf);

        const raw = Buffer.concat(parts);
        let ptr;
        
        if (existingPtr && existingPtr.blockId) {
            if (existingPtr.length >= raw.length) {
                await this.allocator.v1.db._writeChainSafe(existingPtr, raw);
                ptr = existingPtr;
            } else {
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
        return finalPtr;
    }

    async load(ptr) {
        if (!ptr || !ptr.blockId) throw new Error("B\"H: MapNode Load Failed - Null Pointer");
        
        // NO CACHE. Raw Disk Read.
        const block = await this.allocator.v1.db._readChainSafe(ptr);
        if (!block) throw new Error(`B"H: MapNode Load Failed - Block ${ptr.blockId} Empty`);

        const magic = block.toString('utf8', 0, 4);
        if (magic !== constants.MAGIC_MAP_NODE) {
             throw new Error(`B"H: Invalid MapNode Signature at Block ${ptr.blockId}.`);
        }

        let offset = 4;
        const isLeaf = block[offset] === 1; offset++;
        const countInfo = serializer.readVarInt(block, offset); offset += countInfo.bytesRead;
        const totalCount = block.readUInt32BE(offset);
        const totalBytes = readPointer48(block, offset + 4); offset += 10;

        const keys = [];
        for(let i=0; i<countInfo.value; i++) {
            // B"H: Read as Buffer, do NOT convert to string. Zero-Copy view.
            const k = serializer.readBuffer(block, offset); 
            keys.push(k.value); 
            offset += k.bytesRead;
        }
        
        const ptrs = [];
        const ptrCount = isLeaf ? countInfo.value : countInfo.value + 1;
        for(let i=0; i<ptrCount; i++) { 
            const p = Buffer.alloc(16);
            block.copy(p, 0, offset, offset + 16);
            ptrs.push(p); 
            offset += 16; 
        }
        const next = readPointer48(block, offset);
        
        return { selfPtr: ptr, isLeaf, keys, values: isLeaf ? ptrs : [], children: isLeaf ? [] : ptrs, totalCount, totalBytes, next };
    }
}
module.exports = MapNode;
