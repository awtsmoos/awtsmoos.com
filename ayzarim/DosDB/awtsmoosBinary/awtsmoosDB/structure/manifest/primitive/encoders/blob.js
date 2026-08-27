// B"H

/**
 * @file blob.js
 * @chapter The Blob Token Is Binary
 * @description Stores blob metadata tokens as compact binary, not JSON text.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');
const BlobToken = require('../../../../api/blob/tokenCodec.js');

/**
 * @function encodeBlobToken
 * @param {*)} value - Incoming value.
 * @returns {PrimitivePacket|null} Packet.
 */
function encodeBlobToken(value) {
  if (!value || value.__awtsmoosBlob !== true) return null;

  const raw = BlobToken.encode(value);
  return new Packet(TYPE.BLOB, raw, {
    sourceBytes: Number(value.length || 0),
    storedBytes: raw.length
  });
}

module.exports = encodeBlobToken;
