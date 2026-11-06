
// B"H
/**
 * @file dictionary/logic/manifestor.js
 */

const constants = require('../../../constants.js');
const MapEngine = require('../../map/index.js');
const SequenceEngine = require('../../sequence/index.js');
const nodeChecksum = require('../../../utils/nodeChecksum.js');

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
        pos += sLen;

        // B"H §8.5: a wrapper whose parse ends 4 bytes short of its seal
        // must carry a matching checksum trailer. A torn wrapper fails
        // closed with an explicit error instead of handing garbage seals
        // to the map/sequence engines. Legacy wrappers without a trailer
        // keep loading as before.
        if (nodeChecksum.checkTrailer(buf, pos) === null) {
            const error = new Error('B"H dictionary wrapper checksum failed — torn write suspected');
            error.code = 'AWTSMOOSDB_DICTIONARY_CHECKSUM';
            throw error;
        }

        engine.map = new MapEngine(engine.allocator, mSeal);
        engine.seq = new SequenceEngine(engine.allocator, sSeal);
        engine.initialized = true;
    }
};
