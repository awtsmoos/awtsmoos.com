
// B"H

/**
 * @file structure/manifest/primitive/encoders/function.js
 * @chapter The Verb Sealed In Ink
 * @description
 * Functions are stored as source text. Hydration revives simple functions with
 * eval in the same spirit as the existing resurrection tests.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeFunction
 * @description Encodes functions as source text.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeFunction(value) {
  if (typeof value !== 'function') return null;

  let source;

  try {
    source = Function.prototype.toString.call(value);
  } catch (_err) {
    source = 'function(){ return undefined; }';
  }

  return new Packet(TYPE.FUNCTION, Buffer.from(source, 'utf8'));
}

module.exports = encodeFunction;
