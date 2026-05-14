// B"H

/**
 * @file structure/manifest/primitive/encoders/opaqueObject.js
 * @chapter The Unserializable Shell
 * @description
 * Weak collections, promises, and Intl formatters cannot reveal their internal
 * slots to JavaScript. They are preserved as small JSON identity shells so reads
 * return ordinary objects and never crash the storage ritual.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function isOpaqueObject
 * @description
 * Detects standard objects whose inner slots cannot be enumerated or cloned.
 *
 * @param {*} value - Incoming value.
 * @returns {boolean} True when the value should become a JSON shell.
 */
function isOpaqueObject(value) {
  if (!value || typeof value !== 'object') return false;
  if (value instanceof WeakMap || value instanceof WeakSet || value instanceof Promise) return true;
  return !!(globalThis.Intl && value instanceof Intl.DateTimeFormat);
}

/**
 * @function encodeOpaqueObject
 * @description
 * Encodes an unserializable object as a JSON identity shell.
 *
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeOpaqueObject(value) {
  if (!isOpaqueObject(value)) return null;

  const name = value.constructor && value.constructor.name
    ? value.constructor.name
    : 'Object';

  return new Packet(
    TYPE.JSON,
    Buffer.from(JSON.stringify({
      __unserializable__: name
    }), 'utf8')
  );
}

module.exports = encodeOpaqueObject;
