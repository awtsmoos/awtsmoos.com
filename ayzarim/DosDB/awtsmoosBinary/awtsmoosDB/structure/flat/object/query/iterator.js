
// B"H
/**
 * @file iterator.js
 * @description Streams keys and entries flawlessly.
 */
const SmartPointer = require('../../../../utils/smartPointer/index.js');

class ObjectIterator {
    constructor(flatObject) { this.flat = flatObject; }

    *keys() {
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return;
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf || buf.length < 6) return;
        
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            yield buf.toString('utf8', cursor + 1, cursor + 1 + kLen);
            
            const pStart = cursor + 1 + kLen;
            const ptrSize = SmartPointer.readSize(buf, pStart);
            cursor += 1 + kLen + ptrSize;
        }
    }

    *entries(ctx) {
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return;
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf || buf.length < 6) return;
        
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            const keyStr = buf.toString('utf8', cursor + 1, cursor + 1 + kLen);
            
            const pStart = cursor + 1 + kLen;
            const ptrSize = SmartPointer.readSize(buf, pStart);
            const p = buf.subarray(pStart, pStart + ptrSize);
            
            const val = SmartPointer.resolve(p, this.flat.allocator, ctx);
            yield [keyStr, val];
            
            cursor += 1 + kLen + ptrSize;
        }
    }
}
module.exports = ObjectIterator;
