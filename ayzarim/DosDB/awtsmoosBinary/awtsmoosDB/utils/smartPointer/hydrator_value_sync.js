// B"H
/**
 * @file hydrator_value_sync.js
 * @description Synchronous Resurrection of the Omni-Compressed Essence.
 */

const constants = require('../../constants.js');
const omni = require('../omniCompressor.js');
const parser = require('../../deserialize/parser.js');

module.exports = function hydrateValueSync(type, buffer, allocator) {
    if (!buffer) return undefined;
    const T = constants.VAL_TYPE;

    // Resurrect Strings through Omni-Decoder
    if (type === T.STRING || type === T.STRING_OMNI) {
        return (type === T.STRING_OMNI) ? omni.unpack(buffer) : buffer.toString('utf8');
    }

    // Standard JSON Resurrect
    if (type === T.JSON) {
        return parser.parse(buffer);
    }

    // Core Scalars
    if (type === T.BOOLEAN) return buffer[0] === 1;
    if (type === T.SMALL_INT) return buffer[0];
    if (type === T.BUFFER) return buffer;
    if (type === T.NUMBER) return buffer.readDoubleBE(0);

    return buffer;
};
