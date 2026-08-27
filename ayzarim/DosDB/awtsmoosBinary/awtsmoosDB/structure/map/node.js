
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

class MapNode {
    constructor(allocator) {
        this.allocator = allocator;
        this.db = allocator.db;
    }

    load(ptr) {
        if (!ptr || ptr.offset === undefined) return null;
        const buf = this.db._readChainSafe(ptr);
        if (!buf || buf.subarray(0, 4).toString() !== constants.MAGIC_MAP) return null;

        const isLeaf = buf[4] === 1;
        const countRes = Scribe.read(buf, 5);
        let pos = 5 + countRes.bytesRead;
        
        const node = { isLeaf, keys: [], values: isLeaf ? [] : null, children: isLeaf ? null : [] };
        
        for (let i = 0; i < countRes.value; i++) {
            const kLen = Scribe.read(buf, pos); pos += kLen.bytesRead;
            node.keys.push(buf.subarray(pos, pos + kLen.value)); pos += kLen.value;
            const pStart = pos;
            const pSize = SmartPointer.readSize(buf, pStart);
            const seal = buf.subarray(pStart, pStart + pSize);
            if (isLeaf) node.values.push(seal); else node.children.push(seal);
            pos += pSize;
        }

        if (!isLeaf && pos < buf.length) {
            const lastSize = SmartPointer.readSize(buf, pos);
            if (lastSize > 0) node.children.push(buf.subarray(pos, pos + lastSize));
        }

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

        const loc = this.allocator.allocate(total);
        const buf = Buffer.allocUnsafe(total);
        
        buf.write(constants.MAGIC_MAP, 0);
        buf.writeUInt8(node.isLeaf ? 1 : 0, 4);
        let p = 5 + Scribe.write(buf, 5, count);

        for (let i = 0; i < count; i++) {
            p += Scribe.write(buf, p, node.keys[i].length);
            node.keys[i].copy(buf, p); p += node.keys[i].length;
            ptrs[i].copy(buf, p); p += ptrs[i].length;
        }

        if (!node.isLeaf && ptrs.length > count) {
            ptrs[ptrs.length - 1].copy(buf, p);
        }

        this.db._writeChainSafe(loc, buf);
        return SmartPointer.encode(constants.VAL_TYPE.MAP, loc.offset, total);
    }
}

module.exports = MapNode;
