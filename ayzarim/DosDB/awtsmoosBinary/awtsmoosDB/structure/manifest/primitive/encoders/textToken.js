// B"H

/**
 * @file structure/manifest/primitive/encoders/textToken.js
 * @chapter The Token Of Many Letters
 * @description
 * Stores chunked text metadata as one scalar token while the byte-heavy blocks
 * remain in blob bodies.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeTextToken
 * @description Encodes Awtsmoos text tokens.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Packet or null.
 */
function encodeTextToken(value) {
  if (!value || value.__awtsmoosText !== true) return null;
  const raw = Buffer.from(JSON.stringify(value), 'utf8');

  return new Packet(TYPE.TEXT, raw, {
    sourceBytes: raw.length,
    storedBytes: raw.length
  });
}

module.exports = encodeTextToken;
