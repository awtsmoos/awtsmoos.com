
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
        this.db.cacheStructure(ptr, node);
        return node;
    }

    async load(ptrOrId) {
        let ptr = ptrOrId;
        if (typeof ptrOrId === 'number') {
            ptr = { blockId: ptrOrId, offset: 0, length: constants.BLOCK_SIZE, isChain: false };
        }
        
        const cached = this.db.getCachedStructure(ptr);
        if (cached) return cached;
        
        let buf;
        if (ptr.isChain) {
            buf = await this.allocator.v1.db._readChainSafe(ptr);
        } else {
            buf = await this.allocator.v1.readBlockLocked(ptr.blockId, true);
            if(buf) {
                const copy = Buffer.allocUnsafe(buf.length);
                buf.copy(copy);
                buf = copy;
            }
        }
        
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
                 throw new Error(`Invalid Sequence Node Signature at ${ptr.blockId}. Expected SQND`);
             }
        } else {
            const flags = buf.readUInt8(4);
            let itemCount = buf.readUInt16BE(5);
            let totalCount = buf.readUInt32BE(7);
            let totalBytes = readPointer48(buf, 11);
            let totalCapacity = readPointer48(buf, 17);
            const isLeaf = (flags & 1) === 1;

            node = { 
                ptr, buffer: buf, isLeaf, isWeak: (flags & 2) === 2, 
                itemCount, totalCount, totalBytes, totalCapacity
            };
        }
        
        this.db.cacheStructure(ptr, node);
        return node;
    }

    async save(node) {
        if (node.isLeaf) node.totalCount = node.itemCount;
        
        node.buffer.write(constants.MAGIC_SEQ_NODE, 0);
        let flags = node.isLeaf ? 1 : 0;
        if (node.isWeak) flags |= 2;
        node.buffer.writeUInt8(flags, 4);
        node.buffer.writeUInt16BE(node.itemCount, 5);
        node.buffer.writeUInt32BE(node.totalCount, 7);
        writePointer48(node.buffer, node.totalBytes || 0, 11);
        writePointer48(node.buffer, node.totalCapacity, 17);
        
        // B"H: Relocation Logic Mirroring MapNode
        // Sequence nodes are currently 4096 bytes, but this ensures robustness if they vary.
        let finalPtr = node.ptr;
        if (node.ptr && !node.ptr.isChain && node.buffer.length !== node.ptr.length) {
             await this.allocator.v1.free(node.ptr);
             const newPtr = await this.allocator.v1.allocate(node.buffer.length);
             finalPtr = { ...newPtr, length: node.buffer.length };
             node.ptr = finalPtr;
        }

        await this.allocator.v1.db._writeChainSafe(node.ptr, node.buffer);
        // B"H: Update cache with potentially new pointer
        this.db.cacheStructure(node.ptr, node);
        
        // Update engine root if this was the root node
        if (this.engine.ptr && this.engine.ptr.blockId === finalPtr.blockId && this.engine.ptr.offset === finalPtr.offset) {
            this.engine.ptr = finalPtr;
        }
        
        return finalPtr;
    }
}
module.exports = SequenceNode;
