
// B"H
/**
 * @file node.js (SequenceNode)
 */
const constants = require('../../constants.js');
const serializer = require('../../utils/serializer.js');
const SmartPointer = require('../../utils/smartPointer/index.js');
const nodeChecksum = require('../../utils/nodeChecksum.js');

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

        try {
            return this._parse(buf, ptr);
        } catch (_err) {
            // A torn node fails closed as unreadable, never as a crash.
            return null;
        }
    }

    _parse(buf, ptr) {
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
            if (offset >= buf.length) return null;
            const pLenInfo = serializer.readVarInt(buf, offset); offset += pLenInfo.bytesRead;
            if (offset + pLenInfo.value > buf.length) return null;
            const p = buf.subarray(offset, offset + pLenInfo.value); offset += pLenInfo.value;
            let count = 1; if (!isLeaf) { count = buf.readUInt32BE(offset); offset += 4; }
            items.push({ ptr: p, count });
        }
        // B"H §8.5: a node whose parse ends 4 bytes short of its seal
        // must carry a matching checksum trailer, or it is torn.
        if (nodeChecksum.checkTrailer(buf, offset) === null) return null;
        return { ptr, isLeaf, isWeak, items, totalCount, totalBytes };
    }

    save(node) {
        let size = 17;
        for (const item of node.items) {
            const p = SmartPointer.toBuffer(item.ptr);
            size += serializer.getVarIntSize(p.length) + p.length;
            if (!node.isLeaf) size += 4;
        }

        const loc = (this.allocator.v1 || this.allocator).allocate(size + nodeChecksum.TRAILER_BYTES);
        node.ptr = { offset: loc.offset, length: size + nodeChecksum.TRAILER_BYTES, type: constants.VAL_TYPE.SEQUENCE };

        const content = Buffer.allocUnsafe(size).fill(0);
        // Use flat constant MAGIC_SEQ_NODE
        content.write(constants.MAGIC_SEQ_NODE, 0);
        
        content.writeUInt8((node.isLeaf ? 1 : 0) | (node.isWeak ? 2 : 0), 4);
        content.writeUInt16BE(node.items.length, 5);
        content.writeUInt32BE(node.totalCount || 0, 7);
        const tb = node.totalBytes || 0;
        content.writeUInt16BE(Math.floor(tb / 0x100000000), 11);
        content.writeUInt32BE(tb % 0x100000000, 13);
        
        let offset = 17;
        for (const item of node.items) {
            const p = SmartPointer.toBuffer(item.ptr);
            offset += serializer.writeVarIntTo(content, offset, p.length);
            p.copy(content, offset); offset += p.length;
            if (!node.isLeaf) { content.writeUInt32BE(item.count, offset); offset += 4; }
        }
        
        // B"H §8.5: seal the node with a checksum trailer so a torn
        // write fails closed on load instead of parsing as garbage.
        const sealed = nodeChecksum.appendTrailer(content);
        this.db._writeChainSafe(node.ptr, sealed);
        return node.ptr;
    }
}
module.exports = SequenceNode;
