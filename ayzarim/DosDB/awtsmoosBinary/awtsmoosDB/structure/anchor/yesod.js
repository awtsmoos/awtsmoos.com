
// B"H
/**
 * @file yesod.js
 */

const constants = require('../../constants.js');
const Pointer = require('../../utils/pointer/crown.js');

class IdentityAnchor {
    constructor(db, ptr = null) {
        this.db = db;
        this.ptr = ptr;
    }

    create(actualType, dataPtr) {
        const space = this.db.allocator.allocate(32);
        this.ptr = { ...space, type: constants.VAL_TYPE.ANCHOR };
        const buf = Buffer.alloc(32).fill(0);
        buf.write(constants.MAGIC_ANCH, 0);
        buf.writeUInt8(actualType, 4);
        if (dataPtr) { buf.writeUInt8(dataPtr.length, 5); dataPtr.copy(buf, 6); }
        this.db.pager.writeExact(this.ptr.offset, buf);
        return Pointer.encode(constants.VAL_TYPE.ANCHOR, this.ptr.offset, 32);
    }

    resolve() {
        if (!this.ptr) return null;
        const buf = this.db.pager.readExact(this.ptr.offset, 32);
        if (!buf || buf.subarray(0,4).toString() !== constants.MAGIC_ANCH) return null;
        const type = buf.readUInt8(4);
        const pLen = buf.readUInt8(5);
        if (pLen === 0) return null;
        const pSeal = buf.subarray(6, 6 + pLen);
        const dec = Pointer.decode(pSeal);
        return dec ? { ...dec, type } : null;
    }

    update(actualType, dataPtr) {
        if (!this.ptr) { this.create(actualType, dataPtr); return; }
        const buf = Buffer.alloc(32).fill(0);
        buf.write(constants.MAGIC_ANCH, 0);
        buf.writeUInt8(actualType, 4);
        const p = dataPtr || Buffer.alloc(0);
        buf.writeUInt8(p.length, 5);
        p.copy(buf, 6);
        this.db.pager.writeExact(this.ptr.offset, buf);
    }
}

module.exports = IdentityAnchor;
