
// B"H
/**
 * @file dictionary/logic/creator.js
 */

const MapEngine = require('../../map/index.js');
const SequenceEngine = require('../../sequence/index.js');
const constants = require('../../../constants.js');
const nodeChecksum = require('../../../utils/nodeChecksum.js');

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
        const content = Buffer.allocUnsafe(total).fill(0);

        content.write(constants.MAGIC_DIC, 0);
        let p = 4;
        content.writeUInt8(ms.length, p++);
        ms.copy(content, p); p += ms.length;
        content.writeUInt8(ss.length, p++);
        ss.copy(content, p);

        // B"H §8.5: checksum trailer (see inscriber.js).
        const sealed = nodeChecksum.appendTrailer(content);
        const loc = engine.allocator.allocate(sealed.length);
        engine.db._writeChainSafe(loc, sealed);
        engine.map = m; engine.seq = s; engine.initialized = true;
        
        return { ...loc, type: constants.VAL_TYPE.DICTIONARY };
    }
};
