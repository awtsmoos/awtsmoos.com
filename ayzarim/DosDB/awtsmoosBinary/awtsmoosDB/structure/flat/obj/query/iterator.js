
// B"H
const SmartPointer = require('../../../../utils/smartPointer.js');

class ObjectIterator {
    constructor(flatObject) { this.flat = flatObject; }

    *keys() {
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            yield buf.toString('utf8', cursor + 1, cursor + 1 + kLen);
            cursor += 1 + kLen + 16;
        }
    }

    *entries(ctx) {
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            const keyStr = buf.toString('utf8', cursor + 1, cursor + 1 + kLen);
            const p = buf.subarray(cursor + 1 + kLen, cursor + 1 + kLen + 16);
            const val = SmartPointer.resolve(p, this.flat.allocator, ctx);
            yield [keyStr, val];
            cursor += 1 + kLen + 16;
        }
    }
}
module.exports = ObjectIterator;
