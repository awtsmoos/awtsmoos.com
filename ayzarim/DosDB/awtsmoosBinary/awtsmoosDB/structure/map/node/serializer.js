
// B"H
const constants = require('../../../constants.js');
const Pointer = require('../../../utils/smartPointer.js');
const Scribe = require('../../../utils/leb128/scribe.js');

class MapNodeSerializer {
    static save(db, node) {
        const ptrs = node.isLeaf ? node.values : (node.children ||[]);
        let size = 5 + Scribe.sizeOf(node.keys.length);

        for (let i = 0; i < node.keys.length; i++) {
            size += Scribe.sizeOf(node.keys[i].length) + node.keys[i].length;
            size += Pointer.toBuffer(ptrs[i]).length;
        }

        if (!node.isLeaf && ptrs.length > node.keys.length) {
            size += Pointer.toBuffer(ptrs[ptrs.length - 1]).length;
        }

        const loc = db.allocator.allocate(size);
        const buf = Buffer.allocUnsafe(size).fill(0);
        let pos = 0;

        buf.write(constants.MAGIC_MAP, pos); pos += 4;
        buf.writeUInt8(node.isLeaf ? 1 : 0, pos++);
        pos += Scribe.write(buf, pos, node.keys.length);

        for (let i = 0; i < node.keys.length; i++) {
            const k = node.keys[i]; 
            pos += Scribe.write(buf, pos, k.length);
            k.copy(buf, pos); pos += k.length;
            const v = Pointer.toBuffer(ptrs[i]);
            v.copy(buf, pos); pos += v.length;
        }

        if (!node.isLeaf && ptrs.length > node.keys.length) {
            const lastP = Pointer.toBuffer(ptrs[ptrs.length - 1]);
            lastP.copy(buf, pos);
        }

        db.pager.writeExact(loc.offset, buf);
        return Pointer.encode(constants.VAL_TYPE.MAP, loc.offset, size);
    }
}

module.exports = MapNodeSerializer;
