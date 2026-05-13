
// B"H

/**
 * @file structure/manifest/primitive/encoders/regexp.js
 * @chapter The Pattern Was Never A Dictionary
 * @description
 * RegExp must be captured before generic object logic sees it. The payload is
 * JSON containing source and flags. Hydration returns an actual RegExp.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function encodeRegExp
 * @description Encodes regular expressions.
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeRegExp(value) {
  if (!(value instanceof RegExp)) return null;

  return new Packet(
    TYPE.REGEXP,
    Buffer.from(JSON.stringify({
      source: value.source,
      flags: value.flags
    }), 'utf8')
  );
}

module.exports = encodeRegExp;
