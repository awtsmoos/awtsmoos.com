
// B"H
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class SequenceNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
    }

    log(msg) {
        if(this.allocator.v1.db.debug) console.log(`[TRACE SequenceNode] ${msg}`);
    }

    async create(isLeaf) {
        const ptr = await this.allocator.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE);
        const node = { ptr, buffer: buf, isLeaf, itemCount: 0, totalCount: 0, totalBytes: 0, totalCapacity: constants.BLOCK_SIZE };
        return node;
    }

    async load(ptrOrId) {
        let ptr = ptrOrId;
        if (typeof ptrOrId === 'number') {
            ptr = { blockId: ptrOrId, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
        }
        
        const buf = await this.allocator.v1.db._readChainSafe(ptr);
        if (!buf) throw new Error(`Sequence Node ${ptr.blockId} missing`);
        
        const magic = buf.toString('utf8', 0, 4);
        if (magic !== constants.MAGIC_SEQ_NODE) {
             // B"H: If we encounter a zeroed block, treat as empty leaf.
             // This happens if a block was allocated but not yet written to disk when read back.
             if (magic === '\x00\x00\x00\x00') {
                 return { 
                    ptr, buffer: buf, isLeaf: true,
                    itemCount: 0, totalCount: 0,
                    totalBytes: 0, totalCapacity: constants.BLOCK_SIZE
                };
             } else {
                 throw new Error(`Invalid Sequence Node Signature at ${ptr.blockId}:${ptr.offset}. Expected SQND, got ${magic.replace(/\0/g, '\\0')}`);
             }
        }

        const flags = buf.readUInt8(4);
        let itemCount = buf.readUInt16BE(5);
        let totalCount = buf.readUInt32BE(7);
        let totalBytes = readPointer48(buf, 11);
        let totalCapacity = readPointer48(buf, 17);

        // B"H: Sanity Checks for Corruption
        // Max items in a 4KB block is (4096 - 23) / 16 ~= 254.
        // If itemCount is absurd (e.g. > 300), the block is corrupted.
        if (itemCount > 300) { 
            console.warn(`B"H SequenceNode: Corrupt itemCount (${itemCount}) at ${ptr.blockId}. Resetting to 0.`);
            itemCount = 0;
            totalCount = 0;
            totalBytes = 0;
        }
        
        // Sanity Check for TotalBytes. 
        if (totalBytes > 1024 * 1024 * 1024 * 100) { // 100GB limit sanity check
             console.warn(`B"H SequenceNode: Corrupt totalBytes (${totalBytes}) at ${ptr.blockId}. Resetting to 0.`);
             totalBytes = 0;
        }

        const node = { 
            ptr, buffer: buf, isLeaf: (flags & 1) === 1,
            itemCount, totalCount,
            totalBytes, totalCapacity
        };
        return node;
    }

    async save(node) {
        node.buffer.write(constants.MAGIC_SEQ_NODE, 0);
        node.buffer.writeUInt8(node.isLeaf ? 1 : 0, 4);
        node.buffer.writeUInt16BE(node.itemCount, 5);
        node.buffer.writeUInt32BE(node.totalCount, 7);
        
        // B"H: CRITICAL SAFETY CLAMP
        if (node.totalBytes < 0 || !Number.isFinite(node.totalBytes)) {
            console.warn(`B"H SequenceNode: Invalid totalBytes detected (${node.totalBytes}) at ${node.ptr.blockId}. Clamping to 0.`);
            node.totalBytes = 0;
        }
        
        writePointer48(node.buffer, node.totalBytes, 11);
        writePointer48(node.buffer, node.totalCapacity, 17);
        
        await this.allocator.v1.db._writeChainSafe(node.ptr, node.buffer);
    }
}
module.exports = SequenceNode;
