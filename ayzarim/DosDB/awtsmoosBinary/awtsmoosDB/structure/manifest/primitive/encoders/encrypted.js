// B"H

/**
 * @file encrypted.js
 * @chapter The Sealed Spark
 * @description Stores password-encrypted envelopes as exact JSON bytes.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeEncrypted
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Packet.
 */
function encodeEncrypted(value) {
  if (!value || value.__awtsmoosEncrypted !== true) return null;

  const raw = Buffer.from(JSON.stringify(value), 'utf8');
  return new Packet(TYPE.ENCRYPTED, raw, {
    sourceBytes: raw.length,
    storedBytes: raw.length
  });
}

module.exports = encodeEncrypted;
