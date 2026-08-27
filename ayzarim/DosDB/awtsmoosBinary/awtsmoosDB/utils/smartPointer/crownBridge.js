
// B"H

/**
 * @file utils/smartPointer/crownBridge.js
 * @chapter The Old Crown And The New Crown Shake Hands
 * @description
 * Wraps utils/pointer/crown.js without trusting one exact API shape.
 */

const Manual = require('./manualCodec.js');

let Crown = null;

try {
  Crown = require('../pointer/crown.js');
} catch (_err) {
  Crown = null;
}

/**
 * @function encodeWithCrown
 * @description
 * Encodes through old crown module when possible, otherwise manual codec.
 *
 * @param {object} ptr - Pointer object.
 * @returns {Buffer} Pointer seal.
 */
function encodeWithCrown(ptr) {
  if (Crown && typeof Crown.encode === 'function') {
    try {
      return Crown.encode(ptr.type, ptr.offset, ptr.length, ptr.flags || 0);
    } catch (_err) {
      try {
        return Crown.encode(ptr);
      } catch (_err2) {}
    }
  }

  return Manual.encode(ptr);
}

/**
 * @function decodeWithCrown
 * @description
 * Decodes through old crown module when possible, otherwise manual codec.
 *
 * @param {Buffer} seal - Pointer seal.
 * @returns {object} Decoded pointer.
 */
function decodeWithCrown(seal) {
  if (Crown && typeof Crown.decode === 'function') {
    try {
      const ptr = Crown.decode(seal);
      if (ptr && typeof ptr === 'object') return ptr;
    } catch (_err) {}
  }

  return Manual.decode(seal);
}

module.exports = {
  encodeWithCrown,
  decodeWithCrown
};
