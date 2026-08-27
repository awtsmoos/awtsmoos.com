// B"H

/**
 * @file encrypted.js
 * @chapter The Sealed Spark Becomes Binary
 * @description Stores password-encrypted envelopes as compact binary, not JSON text.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');
const EnvelopeCodec = require('../../../../utils/crypto/envelopeCodec.js');

/**
 * @function encodeEncrypted
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Packet.
 */
function encodeEncrypted(value) {
  if (!value || value.__awtsmoosEncrypted !== true) return null;

  const raw = EnvelopeCodec.encode(value);
  return new Packet(TYPE.ENCRYPTED, raw, {
    sourceBytes: Number(Buffer.byteLength(value.body || '', 'utf8')),
    storedBytes: raw.length
  });
}

module.exports = encodeEncrypted;
