
// B"H
/**
 * @file seeker.js
 * @description Extracts precise boundaries.
 */

const SmartPointer = require('../../../utils/smartPointer/index.js');

class Seeker {
    constructor(flatArray) {
        this.flat = flatArray;
    }

    length() {
        if (this.flat.isShattered) return this.flat.engine.length();
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return 0;
        
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf || buf.length < 10) return 0;
        
        return buf.readUInt16BE(4);
    }

    get(index) {
        if (this.flat.isShattered) return this.flat.engine.getPtr(index);
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return undefined;
        
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf || buf.length < 10) return undefined;
        
        const count = buf.readUInt16BE(4);
        if (index < 0 || index >= count) return undefined;
        
        let cursor = 10;
        for(let i = 0; i < index; i++) cursor += SmartPointer.readSize(buf, cursor);
        
        const ptrSize = SmartPointer.readSize(buf, cursor);
        return buf.subarray(cursor, cursor + ptrSize);
    }
}

module.exports = Seeker;
