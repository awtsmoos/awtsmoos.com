
// B"H
/**
 * @file seeker.js
 * @description Navigates B-Tree levels within physical blocks.
 */

const Scribe = require('../../utils/leb128/scribe.js');
const Pointer = require('../../utils/pointer/crown.js');
const constants = require('../../constants.js');

class MapSeeker {
    /**
     * @method get
     * @description Descends the B-Tree based on sorted binary keys.
     */
    static get(db, ptr, key) {
        let currentPtr = ptr;
        const target = Buffer.from(String(key), 'utf8');

        while (currentPtr && currentPtr.offset !== undefined) {
            const buf = db.pager.readExact(currentPtr.offset, currentPtr.length);
            if (!buf || buf.length < 5) return null;

            if (buf.subarray(0, 4).toString() !== constants.MAGIC_MAP) return null;

            const isLeaf = buf[4] === 1;
            const countRes = Scribe.read(buf, 5);
            let pos = 5 + countRes.bytesRead;

            const keys = [];
            const ptrBufs = [];

            for (let i = 0; i < countRes.value; i++) {
                if (pos >= buf.length) break;
                const kLenRes = Scribe.read(buf, pos); pos += kLenRes.bytesRead;
                keys.push(buf.subarray(pos, pos + kLenRes.value)); pos += kLenRes.value;
                const vDec = Pointer.decode(buf, pos);
                if (!vDec) break;
                ptrBufs.push(buf.subarray(pos, pos + vDec.byteSize));
                pos += vDec.byteSize;
            }

            if (!isLeaf && pos < buf.length) {
                const lastDec = Pointer.decode(buf, pos);
                if (lastDec) ptrBufs.push(buf.subarray(pos, pos + lastDec.byteSize));
            }

            let foundIdx = -1;
            let nextChildIdx = 0;
            for (let i = 0; i < keys.length; i++) {
                const cmp = target.compare(keys[i]);
                if (cmp === 0) { foundIdx = i; nextChildIdx = i + 1; break; }
                else if (target.compare(keys[i]) < 0) { nextChildIdx = i; break; }
                nextChildIdx = i + 1;
            }

            if (isLeaf) return foundIdx !== -1 ? ptrBufs[foundIdx] : null;
            else {
                if (nextChildIdx < ptrBufs.length) currentPtr = Pointer.decode(ptrBufs[nextChildIdx]);
                else return null;
            }
        }
        return null;
    }
}

module.exports = MapSeeker;
