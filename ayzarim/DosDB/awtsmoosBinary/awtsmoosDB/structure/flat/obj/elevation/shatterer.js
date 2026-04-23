
// B"H
const constants = require('../../../../constants.js');

class ObjectShatterer {
    constructor(flatObject) { this.flat = flatObject; }

    shatter() {
        const Dictionary = require('../../../dictionary/index.js');
        this.flat.engine = new Dictionary(this.flat.allocator);
        this.flat.engine.create();
        
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            const kStr = buf.toString('utf8', cursor + 1, cursor + 1 + kLen);
            const p = buf.subarray(cursor + 1 + kLen, cursor + 1 + kLen + 16);
            
            this.flat.engine.set(kStr, p, { isPtr: true });
            cursor += 1 + kLen + 16;
        }
        
        this.flat.isShattered = true;
        this.flat.ptr = this.flat.engine.ptr;
        this.flat.ptr.type = constants.VAL_TYPE.DICTIONARY;
    }
}
module.exports = ObjectShatterer;
