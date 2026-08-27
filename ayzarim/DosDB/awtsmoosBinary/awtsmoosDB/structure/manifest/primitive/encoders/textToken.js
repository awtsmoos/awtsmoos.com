// B"H

/**
 * @file structure/manifest/primitive/encoders/textToken.js
 * @chapter The Token Of Many Letters Becomes Binary
 * @description
 * Stores chunked text metadata as a compact binary token, not JSON text,
 * while the byte-heavy blocks remain in blob bodies.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');
const TextToken = require('../../../../api/text/tokenCodec.js');

/**
 * @function encodeTextToken
 * @description Encodes Awtsmoos text tokens.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Packet or null.
 */
function encodeTextToken(value) {
  if (!value || value.__awtsmoosText !== true) return null;
  const raw = TextToken.encode(value);

  return new Packet(TYPE.TEXT, raw, {
    sourceBytes: Number(value.bytes || 0),
    storedBytes: raw.length
  });
}

module.exports = encodeTextToken;
