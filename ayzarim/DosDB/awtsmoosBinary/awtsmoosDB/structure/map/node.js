
// B"H
/**
 * @file structure/map/node.js
 * @description
 * The Mirror of the Node.
 * Translates between living node objects and binary blocks.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer/index.js');
const Scribe = require('../../utils/leb128/scribe.js');
const nodeChecksum = require('../../utils/nodeChecksum.js');

class MapNode {
    constructor(allocator) {
        this.allocator = allocator;
        this.db = allocator.db;
    }

    load(ptr) {
        if (!ptr || ptr.offset === undefined) return null;
        const buf = this.db._readChainSafe(ptr);
        if (!buf || buf.subarray(0, 4).toString() !== constants.MAGIC_MAP) return null;
        try {
            return this._parse(buf);
        } catch (_err) {
            // A torn node fails closed as unreadable, never as a crash.
            return null;
        }
    }

    _parse(buf) {
        const isLeaf = buf[4] === 1;
        const countRes = Scribe.read(buf, 5);
        let pos = 5 + countRes.bytesRead;

        const node = { isLeaf, keys: [], values: isLeaf ? [] : null, children: isLeaf ? null : [] };

        for (let i = 0; i < countRes.value; i++) {
            if (pos >= buf.length) return null;
            const kLen = Scribe.read(buf, pos); pos += kLen.bytesRead;
            if (pos + kLen.value > buf.length) return null;
            node.keys.push(buf.subarray(pos, pos + kLen.value)); pos += kLen.value;
            const pStart = pos;
            const pSize = SmartPointer.readSize(buf, pStart);
            if (pSize <= 0 || pStart + pSize > buf.length) return null;
            const seal = buf.subarray(pStart, pStart + pSize);
            if (isLeaf) node.values.push(seal); else node.children.push(seal);
            pos += pSize;
        }

        if (!isLeaf && pos < buf.length) {
            const lastSize = SmartPointer.readSize(buf, pos);
            if (lastSize <= 0 || pos + lastSize > buf.length) return null;
            node.children.push(buf.subarray(pos, pos + lastSize));
            pos += lastSize;
        }

        // B"H §8.5: a node whose parse ends 4 bytes short of its seal
        // must carry a matching checksum trailer, or it is torn.
        if (nodeChecksum.checkTrailer(buf, pos) === null) return null;

        return node;
    }

    save(node) {
        const ptrs = node.isLeaf ? node.values : node.children;
        const count = node.keys.length;

        let total = 5 + Scribe.sizeOf(count);
        for(let i=0; i<count; i++) {
            total += Scribe.sizeOf(node.keys[i].length) + node.keys[i].length;
            total += ptrs[i].length;
        }
        if (!node.isLeaf && ptrs.length > count) total += ptrs[ptrs.length-1].length;

        const content = Buffer.allocUnsafe(total);

        content.write(constants.MAGIC_MAP, 0);
        content.writeUInt8(node.isLeaf ? 1 : 0, 4);
        let p = 5 + Scribe.write(content, 5, count);

        for (let i = 0; i < count; i++) {
            p += Scribe.write(content, p, node.keys[i].length);
            node.keys[i].copy(content, p); p += node.keys[i].length;
            ptrs[i].copy(content, p); p += ptrs[i].length;
        }

        if (!node.isLeaf && ptrs.length > count) {
            ptrs[ptrs.length - 1].copy(content, p);
        }

        // B"H §8.5: seal the node with a checksum trailer so a torn
        // write fails closed on load instead of parsing as garbage.
        // Legacy nodes without a trailer keep loading as before.
        const sealed = nodeChecksum.appendTrailer(content);
        const loc = this.allocator.allocate(sealed.length);
        this.db._writeChainSafe(loc, sealed);
        return SmartPointer.encode(constants.VAL_TYPE.MAP, loc.offset, sealed.length);
    }
}

module.exports = MapNode;
