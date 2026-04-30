
// B"H
/**
 * @file shatterer.js
 * @description Transmutes a saturated FlatObject into an eternal B-Tree Dictionary.
 */
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

class ObjectShatterer {
    constructor(flatObject) { this.flat = flatObject; }

    shatter() {
        const Dictionary = require('../../../dictionary/index.js');
        this.flat.engine = new Dictionary(this.flat.allocator);
        this.flat.engine.create();
        
        const buf = this.flat.reader.readSafely();
        if (!buf || buf.length < 6) return;
        
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            const pStart = cursor + 1 + kLen;
            const ptrSize = SmartPointer.readSize(buf, pStart);

            const kStr = buf.toString('utf8', cursor + 1, pStart);
            const p = buf.subarray(pStart, pStart + ptrSize);
            
            this.flat.engine.set(kStr, p, { isPtr: true });
            cursor += 1 + kLen + ptrSize;
        }
        
        this.flat.isShattered = true;
        this.flat.ptr = this.flat.engine.ptr;
        this.flat.ptr.type = constants.VAL_TYPE.DICTIONARY;
    }
}
module.exports = ObjectShatterer;
