
// B"H

/**
 * @file structure/manifest/primitive/encoders/boolean.js
 * @chapter The Two Gates Of Yes And No
 * @description
 * A boolean becomes one byte, because truth does not need a palace.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeBoolean
 * @description Encodes booleans.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeBoolean(value) {
  if (typeof value !== 'boolean') return null;
  return new Packet(TYPE.BOOLEAN, Buffer.from([value ? 1 : 0]));
}

module.exports = encodeBoolean;
