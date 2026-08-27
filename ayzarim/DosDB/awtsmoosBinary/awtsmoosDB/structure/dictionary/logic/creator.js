
// B"H
/**
 * @file dictionary/logic/creator.js
 */

const MapEngine = require('../../map/index.js');
const SequenceEngine = require('../../sequence/index.js');
const constants = require('../../../constants.js');

module.exports = {
    /**
     * @method create
     * @description Scribes the initial foundation of a Dictionary.
     */
    create(engine) {
        const m = new MapEngine(engine.allocator);
        const s = new SequenceEngine(engine.allocator);
        
        const ms = m.create(); 
        const ss = s.create(); 
        
        const total = 4 + 1 + ms.length + 1 + ss.length;
        const loc = engine.allocator.allocate(total);
        const buf = Buffer.allocUnsafe(total).fill(0);
        
        buf.write(constants.MAGIC_DIC, 0);
        let p = 4;
        buf.writeUInt8(ms.length, p++);
        ms.copy(buf, p); p += ms.length;
        buf.writeUInt8(ss.length, p++);
        ss.copy(buf, p);

        engine.db._writeChainSafe(loc, buf);
        engine.map = m; engine.seq = s; engine.initialized = true;
        
        return { ...loc, type: constants.VAL_TYPE.DICTIONARY };
    }
};
