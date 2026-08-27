
// B"H

/**
 * @file structure/dictionary/logic/keyText.js
 * @chapter The Name Before The Seal
 * @description
 * A key has a name before it has bytes.
 * A name is the revealed letter-breath.
 * A Buffer may be a pointer-seal, a user value, or an already encoded key.
 * This tiny vessel gives the Dictionary one clear law:
 * order-memory stores names, not seals.
 */

/**
 * @function toKeyText
 * @description
 * Converts a dictionary key into stable visible text.
 *
 * @param {*} key - Any incoming dictionary key.
 * @returns {string} Textual key for order lists and encoding.
 */
function toKeyText(key) {
  if (Buffer.isBuffer(key)) return key.toString('utf8');
  return String(key);
}

module.exports = toKeyText;
