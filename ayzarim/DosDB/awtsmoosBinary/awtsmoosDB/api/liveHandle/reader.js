// B"H
/**
 * @file reader.js
 * @description The Immediate Reader of the Interface.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');

class Reader {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    length() {
        const structPtr = this.handle.nav.resolveStructPtr();
        if (!structPtr) return 0;
        
        const T = constants.VAL_TYPE;
        if (this.handle.type === T.SEQUENCE) {
            const Sequence = require('../../structure/sequence/index.js');
            return (new Sequence(this.db.allocator, structPtr)).length();
        }
        return 0;
    }

    resolveSelf() {
        if (!this.handle.ptr) return undefined;
        return SmartPointer.resolve(this.handle.ptr, this.db.allocator);
    }
}
module.exports = Reader;
