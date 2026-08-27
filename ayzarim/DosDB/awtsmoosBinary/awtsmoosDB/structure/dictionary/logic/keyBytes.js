
// B"H

/**
 * @file structure/dictionary/logic/keyBytes.js
 * @chapter The Letters Enter The Stone
 * @description
 * The map engine wants bytes.
 * The object-order sequence wants names.
 * This vessel only handles the bytes side, clean and small.
 */

const toKeyText = require('./keyText.js');

/**
 * @function toKeyBytes
 * @description
 * Encodes a key as UTF-8 bytes for lower map storage.
 *
 * @param {*} key - Any incoming dictionary key.
 * @returns {Buffer} UTF-8 key bytes.
 */
function toKeyBytes(key) {
  return Buffer.from(toKeyText(key), 'utf8');
}

module.exports = toKeyBytes;
