


// B"H
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class SequenceNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
        this.db = allocator.v1.db;
    }

    log(msg) {
        if(this.db.debug) console.log(`[SQND] ${msg}`);
    }

    async create(isLeaf, isWeak = false) {
        const ptr = await this.allocator.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.allocUnsafe(constants.BLOCK_SIZE);
        buf.fill(0);
        
        const node = { ptr, buffer: buf, isLeaf, isWeak, itemCount: 0, totalCount: 0, totalBytes: 0, totalCapacity: constants.BLOCK_SIZE };
        this.db.cacheStructure(ptr.blockId, node);
        //this.log(`Created B${ptr.blockId} (Leaf: ${isLeaf})`);
        return node;
    }

    async load(ptrOrId) {
        let ptr = ptrOrId;
        if (typeof ptrOrId === 'number') {
            ptr = { blockId: ptrOrId, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
        }
        
        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached;
        
        const buf = await this.allocator.v1.db._readChainSafe(ptr);
        if (!buf) throw new Error(`Sequence Node ${ptr.blockId} missing`);
        
        const magic = buf.toString('utf8', 0, 4);
        let node;
        
        if (magic !== constants.MAGIC_SEQ_NODE) {
             if (magic === '\x00\x00\x00\x00') {
                 node = { 
                    ptr, buffer: buf, isLeaf: true, isWeak: false,
                    itemCount: 0, totalCount: 0,
                    totalBytes: 0, totalCapacity: constants.BLOCK_SIZE
                };
             } else {
                 throw new Error(`Invalid Sequence Node Signature at ${ptr.blockId}:${ptr.offset}. Expected SQND, got ${magic.replace(/\0/g, '\\0')}`);
             }
        } else {
            const flags = buf.readUInt8(4);
            let itemCount = buf.readUInt16BE(5);
            let totalCount = buf.readUInt32BE(7);
            let totalBytes = readPointer48(buf, 11);
            let totalCapacity = readPointer48(buf, 17);

            const isLeaf = (flags & 1) === 1;

            // B"H: Aggressive Correction - Self-Healing
            if (isLeaf) {
                if (itemCount > 200) { 
                    itemCount = 200;
                }
                // For leaves, totalCount MUST equal itemCount.
                if (totalCount !== itemCount) {
                    // console.warn(`[SQND] B${ptr.blockId} Leaf Count Mismatch Fix: Total=${totalCount} Item=${itemCount}`);
                    totalCount = itemCount;
                }
            }

            node = { 
                ptr, buffer: buf, 
                isLeaf,
                isWeak: (flags & 2) === 2, 
                itemCount, totalCount,
                totalBytes, totalCapacity
            };
        }
        
        this.db.cacheStructure(ptr.blockId, node);
        return node;
    }

    async save(node) {
        // B"H: Enforce limit and consistency before writing to disk
        if (node.isLeaf) {
            if (node.itemCount > 200) {
                node.itemCount = 200;
            }
            node.totalCount = node.itemCount;
        }
        
        //this.log(`Saving B${node.ptr.blockId} (Leaf:${node.isLeaf}, Count:${node.totalCount}, Items:${node.itemCount})`);

        node.buffer.write(constants.MAGIC_SEQ_NODE, 0);
        
        let flags = node.isLeaf ? 1 : 0;
        if (node.isWeak) flags |= 2;
        node.buffer.writeUInt8(flags, 4);
        
        node.buffer.writeUInt16BE(node.itemCount, 5);
        node.buffer.writeUInt32BE(node.totalCount, 7);
        
        if (node.totalBytes < 0 || !Number.isFinite(node.totalBytes)) node.totalBytes = 0;
        
        writePointer48(node.buffer, node.totalBytes, 11);
        writePointer48(node.buffer, node.totalCapacity, 17);
        
        const startOfData = 23; 
        const itemSize = node.isLeaf ? 16 : 20;
        const usedSize = node.itemCount * itemSize;
        const endOfData = startOfData + usedSize;
        
        // B"H: CRITICAL - Zero out unused space to prevent ghost data (stale entries past itemCount)
        if (endOfData < node.buffer.length) {
            node.buffer.fill(0, endOfData);
        }

        // Remove from cache to ensure next read gets fresh data from disk/buffer-manager
        this.db.structureCache.delete(node.ptr.blockId);
        
        await this.allocator.v1.db._writeChainSafe(node.ptr, node.buffer);
    }
}
module.exports = SequenceNode;
