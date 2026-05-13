
// B"H

/**
 * @file structure/manifest/primitive/encoders/text.js
 * @chapter The Letters Enter The Stone
 * @description
 * Ordinary text becomes UTF-8. Text carrying the special bell goes through
 * Omni compression if available.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

let Omni = null;

try {
  Omni = require('../../../utils/compression/omni.js');
} catch (_err) {
  Omni = null;
}

/**
 * @function encodeText
 * @description Encodes strings.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeText(value) {
  if (typeof value !== 'string') return null;

  if (Omni && value.indexOf('\x07') !== -1) {
    return new Packet(TYPE.STRING_OMNI, Omni.pack(value));
  }

  return new Packet(TYPE.STRING, Buffer.from(value, 'utf8'));
}

module.exports = encodeText;
