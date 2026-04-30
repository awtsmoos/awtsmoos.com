
// B"H
/**
 * @file stable.js
 * @chapter The House of Yesod (Foundation)
 * @description Stable identity anchors that persist across data relocations.
 */

const constants = require('../../constants.js');
const Pointer = require('../../utils/pointer/crown.js');

class StableAnchor {
    constructor(db) { this.db = db; }

    /**
     * @method create
     * @description Claims a fixed 32-byte space to represent a structure's soul.
     */
    create(type, dataPtr) {
        const loc = this.db.allocator.allocate(32);
        const buf = this._generate(type, dataPtr);
        this.db.pager.writeExact(loc.offset, buf);
        return Pointer.encode(constants.VAL_TYPE.ANCHOR, loc.offset, 32);
    }

    /**
     * @method update
     * @description Points the fixed anchor to a new physical data location.
     */
    update(anchorSeal, type, newDataPtr) {
        const dec = Pointer.decode(anchorSeal);
        if (!dec) return;
        const buf = this._generate(type, newDataPtr);
        this.db.pager.writeExact(dec.offset, buf);
    }

    /**
     * @method resolve
     * @description Peeks into the anchor to reveal the actual structure coordinates.
     */
    resolve(anchorSeal) {
        const dec = Pointer.decode(anchorSeal);
        if (!dec) return null;
        const buf = this.db.pager.readExact(dec.offset, 32);
        if (!buf || buf.subarray(0, 4).toString() !== constants.MAGIC_ANCH) return null;
        
        const type = buf.readUInt8(4);
        const pLen = buf.readUInt8(5);
        if (pLen === 0) return null;
        const seal = buf.subarray(6, 6 + pLen);
        const innerDec = Pointer.decode(seal);
        return innerDec ? { ...innerDec, type } : null;
    }

    /**
     * @method _generate
     * @description Scribes the Anchor block: [MAGIC][TYPE][PTR_LEN][PTR_BYTES]
     */
    _generate(type, ptrBuf) {
        const buf = Buffer.alloc(32).fill(0);
        buf.write(constants.MAGIC_ANCH, 0);
        buf.writeUInt8(type, 4);
        const p = ptrBuf || Buffer.alloc(0);
        buf.writeUInt8(p.length, 5);
        p.copy(buf, 6);
        return buf;
    }
}

module.exports = StableAnchor;
