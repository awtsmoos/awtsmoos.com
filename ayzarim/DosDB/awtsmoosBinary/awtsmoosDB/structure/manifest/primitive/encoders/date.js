
// B"H

/**
 * @file structure/manifest/primitive/encoders/date.js
 * @chapter Time Receives A Body
 * @description
 * Date is stored as epoch milliseconds in a double.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeDate
 * @description Encodes Date objects.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeDate(value) {
  if (!(value instanceof Date)) return null;

  const buffer = Buffer.allocUnsafe(8);
  buffer.writeDoubleBE(value.getTime(), 0);

  return new Packet(TYPE.DATE, buffer);
}

module.exports = encodeDate;
