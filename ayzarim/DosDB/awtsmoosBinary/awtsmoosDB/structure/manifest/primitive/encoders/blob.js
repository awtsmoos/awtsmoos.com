// B"H

/**
 * @file blob.js
 * @chapter The Blob Token
 * @description Stores blob metadata tokens, not blob body bytes.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeBlobToken
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Packet.
 */
function encodeBlobToken(value) {
  if (!value || value.__awtsmoosBlob !== true) return null;

  const raw = Buffer.from(JSON.stringify(value), 'utf8');
  return new Packet(TYPE.BLOB, raw, {
    sourceBytes: raw.length,
    storedBytes: raw.length
  });
}

module.exports = encodeBlobToken;
