
// B"H
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class SequenceNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
    }

    log(msg) {
        console.log(`[TRACE SequenceNode] ${msg}`);
    }

    async create(isLeaf) {
        // B"H: Use allocate to get a pointer (possibly in shared block)
        const ptr = await this.allocator.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE);
        // this.log(`Created new Node at B${ptr.blockId}:O${ptr.offset} (Leaf: ${isLeaf})`);
        
        const node = { ptr, buffer: buf, isLeaf, itemCount: 0, totalCount: 0, totalBytes: 0, totalCapacity: constants.BLOCK_SIZE };
        this.cacheNode(ptr.blockId, node);
        return node;
    }

    async load(ptrOrId) {
        let ptr = ptrOrId;
        if (typeof ptrOrId === 'number') {
            ptr = { blockId: ptrOrId, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
        }
        
        if (this.engine.cache.has(ptr.blockId)) {
            return this.engine.cache.get(ptr.blockId);
        }
        
        // this.log(`Loading Node B${ptr.blockId}:O${ptr.offset}`);
        const buf = await this.allocator.v1.db._readChainSafe(ptr);
        if (!buf) throw new Error(`Sequence Node ${ptr.blockId} missing`);
        
        const magic = buf.toString('utf8', 0, 4);
        if (magic !== constants.MAGIC_SEQ_NODE) {
             // In case of empty initialization or corruption
             if (magic === '\x00\x00\x00\x00') {
                 // Treat as empty leaf?
             } else {
                 throw new Error(`Invalid Sequence Node Signature at ${ptr.blockId}:${ptr.offset}. Expected SQND, got ${magic}`);
             }
        }

        const flags = buf.readUInt8(4);
        const node = { 
            ptr, buffer: buf, isLeaf: (flags & 1) === 1,
            itemCount: buf.readUInt16BE(5), totalCount: buf.readUInt32BE(7),
            totalBytes: readPointer48(buf, 11), totalCapacity: readPointer48(buf, 17)
        };
        // this.log(`Loaded Node B${ptr.blockId}. ItemCount=${node.itemCount} TotalCount=${node.totalCount} IsLeaf=${node.isLeaf}`);
        
        this.cacheNode(ptr.blockId, node);
        return node;
    }

    async save(node) {
        // this.log(`Saving Node B${node.ptr.blockId}. ItemCount=${node.itemCount} TotalCount=${node.totalCount}`);
        node.buffer.write(constants.MAGIC_SEQ_NODE, 0);
        node.buffer.writeUInt8(node.isLeaf ? 1 : 0, 4);
        node.buffer.writeUInt16BE(node.itemCount, 5);
        node.buffer.writeUInt32BE(node.totalCount, 7);
        writePointer48(node.buffer, node.totalBytes, 11);
        writePointer48(node.buffer, node.totalCapacity, 17);
        
        await this.allocator.v1.db._writeChainSafe(node.ptr, node.buffer);
        
        // Update Cache in case ptr changed (though Sequence nodes are usually fixed block size)
        this.cacheNode(node.ptr.blockId, node);
    }
    
    cacheNode(blockId, node) {
        if (this.engine.cache.size >= this.engine.CACHE_LIMIT) {
            const first = this.engine.cache.keys().next().value;
            this.engine.cache.delete(first);
        }
        this.engine.cache.set(blockId, node);
    }
}
module.exports = SequenceNode;
