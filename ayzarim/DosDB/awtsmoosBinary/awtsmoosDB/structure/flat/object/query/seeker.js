
// B"H
/**
 * @file seeker.js
 * @description Extracts values from the flat binary object with absolute safety.
 */
const SmartPointer = require('../../../../utils/smartPointer/index.js');

class ObjectSeeker {
    constructor(flatObject) { this.flat = flatObject; }

    length() {
        if (this.flat.isShattered) return this.flat.engine.seq.length();
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return 0;
        
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf || buf.length < 6) return 0;
        return buf.readUInt16BE(4);
    }

    get(key) {
        if (this.flat.isShattered) return this.flat.engine.getPtr(key);
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return undefined;
        
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf || buf.length < 6) return undefined;
        
        const count = buf.readUInt16BE(4);
        const keyBuf = Buffer.from(key, 'utf8');
        
        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            const pStart = cursor + 1 + kLen;
            const ptrSize = SmartPointer.readSize(buf, pStart);

            if (kLen === keyBuf.length) {
                const kBytes = buf.subarray(cursor + 1, pStart);
                if (kBytes.compare(keyBuf) === 0) {
                    return buf.subarray(pStart, pStart + ptrSize);
                }
            }
            cursor += 1 + kLen + ptrSize;
        }
        return undefined;
    }
}
module.exports = ObjectSeeker;
