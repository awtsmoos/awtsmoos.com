
// B"H

/**
 * @file structure/manifest/primitive/encoders/boolean.js
 * @chapter The Two Gates Of Yes And No
 * @description
 * Booleans are now zero-byte marker types. Truth and falsehood do
 * not need a payload body behind the pointer crown.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeBoolean
 * @description Encodes booleans as zero-byte markers.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeBoolean(value) {
  if (typeof value !== 'boolean') return null;
  return new Packet(value ? TYPE.BOOLEAN_TRUE : TYPE.BOOLEAN_FALSE);
}

module.exports = encodeBoolean;
