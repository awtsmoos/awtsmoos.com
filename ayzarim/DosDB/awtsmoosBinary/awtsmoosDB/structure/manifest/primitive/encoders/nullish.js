
// B"H

/**
 * @file structure/manifest/primitive/encoders/nullish.js
 * @chapter The Quiet Before Form
 * @description
 * Null and undefined are not accidents. They are explicit empty vessels.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeNullish
 * @description Encodes null and undefined.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeNullish(value) {
  if (value === null) return new Packet(TYPE.NULL);
  if (value === undefined) return new Packet(TYPE.UNDEFINED);
  return null;
}

module.exports = encodeNullish;
