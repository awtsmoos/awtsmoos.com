// B"H
const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

class SequenceNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
        this.db = allocator.v1.db;
    }

    create(isLeaf, isWeak = false) {
        const ptr = this.allocator.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        const node = { ptr, buffer: buf, isLeaf, isWeak, itemCount: 0, totalCount: 0, totalBytes: 0, totalCapacity: constants.BLOCK_SIZE };
        this.db.cacheStructure(ptr.blockId, node);
        return node;
    }

    load(ptr) {
        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached;
        const buf = this.db._readChainSafe(ptr);
        const flags = buf.readUInt8(4);
        const node = { 
            ptr, buffer: buf, 
            isLeaf: (flags & 1) === 1,
            isWeak: (flags & 2) === 2, 
            itemCount: buf.readUInt16BE(5),
            totalCount: buf.readUInt32BE(7),
            totalBytes: readPointer48(buf, 11)
        };
        this.db.cacheStructure(ptr.blockId, node);
        return node;
    }

    save(node) {
        const buf = node.buffer;
        buf.write(constants.MAGIC_SEQ_NODE, 0);
        let flags = node.isLeaf ? 1 : 0;
        if (node.isWeak) flags |= 2;
        buf.writeUInt8(flags, 4);
        buf.writeUInt16BE(node.itemCount, 5);
        buf.writeUInt32BE(node.totalCount, 7);
        writePointer48(buf, node.totalBytes, 11);
        this.db._writeChainSafe(node.ptr, buf);
    }
}
module.exports = SequenceNode;
