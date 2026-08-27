
/**
 * @file manifest.js
 * @chapter The Fixity of Purpose (Yesod)
 * @description
 * Yesod is the Foundation. In our exact-byte system, structures must relocate
 * on disk to grow. This relocation normally shatters circular dependencies.
 * 
 * The StableAnchor remains at a FIXED offset in the void. It is a 
 * 32-byte vessel that reflects the *current* location of the structure.
 * External pointers refer to the Anchor; the Anchor refers to the data.
 */

const Pointer = require('../../../utils/pointer/crown.js');
const constants = require('../../../constants.js');

class StableAnchorManifest {
    constructor(db) { this.db = db; }

    /**
     * @method create
     * @description Establishes a permanent coordinate for an identity.
     */
    create(type, dataPtrBuf) {
        const loc = this.db.allocator.allocate(32);
        const buf = this._generate(type, dataPtrBuf);
        this.db.pager.writeExact(loc.offset, buf);
        return Pointer.encode(constants.VAL_TYPE.ANCHOR, loc.offset, 32);
    }

    /**
     * @method update
     * @description Overwrites the anchor's reflection with a new coordinate.
     */
    update(anchorSeal, actualType, newDataPtr) {
        const dec = Pointer.decode(anchorSeal);
        if (!dec) return;
        const buf = this._generate(actualType, newDataPtr);
        this.db.pager.writeExact(dec.offset, buf);
    }

    /**
     * @method resolve
     * @description Peeks into the anchor to see the true face of the data.
     */
    resolve(anchorSeal) {
        const dec = Pointer.decode(anchorSeal);
        if (!dec) return null;
        const buf = this.db.pager.readExact(dec.offset, 32);
        if (!buf || buf.subarray(0,4).toString() !== constants.MAGIC.ANCHOR) return null;
        
        const type = buf.readUInt8(4);
        const pLen = buf.readUInt8(5);
        if (pLen === 0) return null;
        const seal = buf.subarray(6, 6 + pLen);
        const innerDec = Pointer.decode(seal);
        return innerDec ? { ...innerDec, type } : null;
    }

    _generate(type, ptrBuf) {
        const buf = Buffer.alloc(32).fill(0);
        buf.write(constants.MAGIC.ANCHOR, 0);
        buf.writeUInt8(type, 4);
        const p = ptrBuf || Buffer.alloc(0);
        buf.writeUInt8(p.length, 5);
        p.copy(buf, 6);
        return buf;
    }
}

module.exports = StableAnchorManifest;
