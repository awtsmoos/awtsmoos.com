
// B"H

/**
 * @file structure/manifest/primitive/encoders/symbol.js
 * @chapter The Hidden Name Returns By Registry
 * @description
 * Symbols are encoded by global key when possible, otherwise description.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeSymbol
 * @description Encodes Symbols as UTF-8 registry names.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeSymbol(value) {
  if (typeof value !== 'symbol') return null;

  const name = Symbol.keyFor(value) || value.description || '';

  return new Packet(TYPE.SYMBOL, Buffer.from(name, 'utf8'));
}

module.exports = encodeSymbol;
