
// B"H
/**
 * @file dictionary/logic/manifestor.js
 */

const constants = require('../../../constants.js');
const MapEngine = require('../../map/index.js');
const SequenceEngine = require('../../sequence/index.js');

module.exports = {
    /**
     * @method initialize
     * @description Pulls sub-engines back from the void.
     */
    initialize(engine) {
        const buf = engine.db._readChainSafe(engine.ptr);
        if (!buf || buf.subarray(0, 4).toString() !== constants.MAGIC_DIC) return;

        let pos = 4;
        const mLen = buf.readUInt8(pos++);
        const mSeal = buf.subarray(pos, pos + mLen);
        pos += mLen;

        const sLen = buf.readUInt8(pos++);
        const sSeal = buf.subarray(pos, pos + sLen);

        engine.map = new MapEngine(engine.allocator, mSeal);
        engine.seq = new SequenceEngine(engine.allocator, sSeal);
        engine.initialized = true;
    }
};
