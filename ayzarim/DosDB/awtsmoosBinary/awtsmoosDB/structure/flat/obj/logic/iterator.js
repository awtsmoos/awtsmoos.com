
// B"H
/**
 * @file iterator.js
 * @description Streams keys and entries from the FlatObject.
 */
const SmartPointer = require('../../../../utils/smartPointer.js');

class Iterator {
    constructor(flat) { this.flat = flat; }

    *keys() {
        const buf = this.flat.reader.read();
        const count = buf.readUInt16BE(4);
        let cur = 6;
        for (let i = 0; i < count; i++) {
            if (cur >= buf.length) break;
            const kLen = buf.readUInt8(cur);
            yield buf.toString('utf8', cur + 1, cur + 1 + kLen);
            cur += 1 + kLen + 16;
        }
    }

    *entries(ctx) {
        const buf = this.flat.reader.read();
        const count = buf.readUInt16BE(4);
        let cur = 6;
        for (let i = 0; i < count; i++) {
            if (cur >= buf.length) break;
            const kLen = buf.readUInt8(cur);
            const k = buf.toString('utf8', cur + 1, cur + 1 + kLen);
            const p = buf.subarray(cur + 1 + kLen, cur + 1 + kLen + 16);
            yield [k, SmartPointer.resolve(p, this.flat.allocator, ctx)];
            cur += 1 + kLen + 16;
        }
    }
}
module.exports = Iterator;
