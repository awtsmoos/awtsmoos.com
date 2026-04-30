
/**
 * @file crown.js
 * @chapter The Seal of Keter
 * @description
 * Keter is the Crown, the absolute apex. It is the boundary where the 
 * infinite Light is first identified as a specific 'Something'.
 * 
 * The SmartPointer is the Crown of every piece of data. It holds:
 * 1. The Name (Type)
 * 2. The Space (Offset)
 * 3. The Form (Length)
 *
 * Because of the Scribe's LEB128 ritual, this crown is flexible, 
 * growing or shrinking to perfectly fit the coordinate it represents.
 */

const Scribe = require('../leb128/scribe.js');

class PointerCrown {
    /**
     * @description Seals the soul's coordinates into a binary crown.
     * @returns {Buffer} The variable-size seal.
     */
    static encode(type, offset, length) {
        const buf = Buffer.allocUnsafe(25);
        let pos = 0;
        buf[pos++] = type & 0xFF;
        pos += Scribe.write(buf, pos, offset || 0);
        pos += Scribe.write(buf, pos, length || 0);
        return buf.subarray(0, pos);
    }

    /**
     * @description Decodes a crown to reveal the dwelling place of data.
     */
    static decode(buf, start = 0) {
        if (!buf || buf.length <= start) return null;
        let pos = start;
        const type = buf[pos++];
        const off = Scribe.read(buf, pos); pos += off.bytesRead;
        const len = Scribe.read(buf, pos); pos += len.bytesRead;
        return { type, offset: off.value, length: len.value, byteSize: pos - start };
    }

    /**
     * @description Turns an abstract pointer object back into its physical binary seal.
     */
    static toBuffer(p) {
        if (!p) return Buffer.alloc(0);
        if (Buffer.isBuffer(p)) return p;
        return this.encode(p.type || 0, p.offset || 0, p.length || 0);
    }

    /**
     * @description Peeks at the Divine Type of a vessel.
     */
    static getType(buf, start = 0) {
        if (!buf || buf.length <= start) return 0;
        return buf[start] & 0xFF;
    }
}

module.exports = PointerCrown;
