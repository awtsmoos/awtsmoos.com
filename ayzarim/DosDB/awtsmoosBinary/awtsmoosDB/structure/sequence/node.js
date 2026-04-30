
// B"H
/**
 * @file node.js (SequenceNode)
 */
const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const SmartPointer = require('../../utils/smartPointer/index.js');

class SequenceNode {
    constructor(allocator, engine) { 
        this.allocator = allocator; 
        this.engine = engine;
        this.db = allocator.db || (allocator.v1 ? allocator.v1.db : null);
    }

    create(isLeaf, isWeak = false) {
        return { ptr: null, items: [], isLeaf, isWeak, totalCount: 0, totalBytes: 0 };
    }

    load(ptr) {
        if (!ptr || ptr.offset === undefined) return null;
        let buf = this.db._readChainSafe(ptr);
        if (!buf || buf.length < 17) return null;
        
        // Use flat constant MAGIC_SEQ_NODE
        if (buf.subarray(0, 4).toString() !== constants.MAGIC_SEQ_NODE) return null;

        const flags = buf.readUInt8(4);
        const isLeaf = (flags & 1) === 1;
        const isWeak = (flags & 2) === 2;
        const itemCount = buf.readUInt16BE(5);
        const totalCount = buf.readUInt32BE(7);
        const high = buf.readUInt16BE(11), low = buf.readUInt32BE(13);
        const totalBytes = (high * 0x100000000) + low;
        
        let offset = 17;
        const items = [];
        for(let i = 0; i < itemCount; i++) {
            if (offset >= buf.length) break;
            const pLenInfo = serializer.readVarInt(buf, offset); offset += pLenInfo.bytesRead;
            const p = buf.subarray(offset, offset + pLenInfo.value); offset += pLenInfo.value;
            let count = 1; if (!isLeaf) { count = buf.readUInt32BE(offset); offset += 4; }
            items.push({ ptr: p, count });
        }
        return { ptr, isLeaf, isWeak, items, totalCount, totalBytes };
    }

    save(node) {
        let size = 17;
        for (const item of node.items) {
            const p = SmartPointer.toBuffer(item.ptr);
            size += serializer.getVarIntSize(p.length) + p.length;
            if (!node.isLeaf) size += 4;
        }

        const loc = (this.allocator.v1 || this.allocator).allocate(size);
        node.ptr = { offset: loc.offset, length: size, type: constants.VAL_TYPE.SEQUENCE };

        const buf = Buffer.allocUnsafe(size).fill(0);
        // Use flat constant MAGIC_SEQ_NODE
        buf.write(constants.MAGIC_SEQ_NODE, 0);
        
        buf.writeUInt8((node.isLeaf ? 1 : 0) | (node.isWeak ? 2 : 0), 4);
        buf.writeUInt16BE(node.items.length, 5);
        buf.writeUInt32BE(node.totalCount || 0, 7);
        const tb = node.totalBytes || 0;
        buf.writeUInt16BE(Math.floor(tb / 0x100000000), 11);
        buf.writeUInt32BE(tb % 0x100000000, 13);
        
        let offset = 17;
        for (const item of node.items) {
            const p = SmartPointer.toBuffer(item.ptr);
            offset += serializer.writeVarIntTo(buf, offset, p.length);
            p.copy(buf, offset); offset += p.length;
            if (!node.isLeaf) { buf.writeUInt32BE(item.count, offset); offset += 4; }
        }
        
        this.db._writeChainSafe(node.ptr, buf);
        return node.ptr;
    }
}
module.exports = SequenceNode;
