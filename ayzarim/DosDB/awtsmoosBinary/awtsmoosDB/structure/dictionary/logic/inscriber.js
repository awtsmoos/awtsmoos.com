
// B"H
/**
 * @file dictionary/logic/inscriber.js
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

module.exports = {
    /**
     * @method set
     * @description Overwrites or appends a key within the Dictionary.
     */
    set(engine, key, valPtr, options) {
        const ek = Buffer.from(String(key), 'utf8');
        const exists = engine.map.getPtr(ek);
        const newMS = engine.map.set(ek, valPtr);
        
        if (!exists) engine.seq.push(key);
        const newSS = SmartPointer.toBuffer(engine.seq.ptr);
        
        const total = 4 + 1 + newMS.length + 1 + newSS.length;
        const loc = engine.allocator.allocate(total);
        const buf = Buffer.allocUnsafe(total).fill(0);
        
        buf.write(constants.MAGIC_DIC, 0);
        let p = 4;
        buf.writeUInt8(newMS.length, p++);
        newMS.copy(buf, p); p += newMS.length;
        buf.writeUInt8(newSS.length, p++);
        newSS.copy(buf, p);

        engine.db._writeChainSafe(loc, buf);
        return { ...loc, type: constants.VAL_TYPE.DICTIONARY };
    }
};
