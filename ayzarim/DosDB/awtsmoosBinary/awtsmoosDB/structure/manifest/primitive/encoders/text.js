
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
const Compression = require('../compression.js');

let Omni = null;

try {
  Omni = require('../../../../utils/compression/omni.js');
} catch (_err) {
  Omni = null;
}

/**
 * @function encodeText
 * @description Encodes strings.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeText(value, context) {
  if (typeof value !== 'string') return null;

  const rawBytes = Buffer.byteLength(value, 'utf8');

  if (Omni && Compression.isEnabled(context)) {
    const packed = Omni.packText(value);

    if (packed.compressed) {
      return new Packet(TYPE.STRING_OMNI, packed.buffer, {
        sourceBytes: rawBytes,
        storedBytes: packed.buffer.length,
        compressed: true
      });
    }
  }

  if (Omni && value.indexOf('\x07') !== -1) {
    const packed = Omni.pack(value, {
      compress: false
    });

    return new Packet(TYPE.STRING_OMNI, packed, {
      sourceBytes: rawBytes,
      storedBytes: packed.length
    });
  }

  const raw = Buffer.from(value, 'utf8');

  return new Packet(TYPE.STRING, raw, {
    sourceBytes: rawBytes,
    storedBytes: raw.length
  });
}

module.exports = encodeText;
