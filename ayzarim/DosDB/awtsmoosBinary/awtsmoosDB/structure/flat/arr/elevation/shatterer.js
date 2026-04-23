
// B"H
const constants = require('../../../../constants.js');

class ArrayShatterer {
    constructor(flatArray) { this.flat = flatArray; }

    shatter() {
        const Sequence = require('../../../sequence/index.js');
        this.flat.engine = new Sequence(this.flat.allocator);
        this.flat.engine.create();
        
        const buf = this.flat.reader.readSafely();
        const count = buf.readUInt32BE(4);
        let cursor = 8;
        
        for(let i = 0; i < count; i++) {
            if (cursor + 16 > buf.length) break;
            const p = buf.subarray(cursor, cursor + 16);
            this.flat.engine.push(p, { isPtr: true }); 
            cursor += 16;
        }
        
        this.flat.isShattered = true;
        this.flat.ptr = this.flat.engine.ptr;
        this.flat.ptr.type = constants.VAL_TYPE.SEQUENCE;
    }
}
module.exports = ArrayShatterer;
