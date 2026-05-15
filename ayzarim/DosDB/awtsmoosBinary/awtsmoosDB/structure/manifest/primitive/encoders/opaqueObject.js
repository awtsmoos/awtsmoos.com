// B"H

/**
 * @file structure/manifest/primitive/encoders/opaqueObject.js
 * @chapter The Unserializable Shell Becomes Small
 * @description
 * Weak collections, promises, and Intl formatters cannot reveal their internal
 * slots to JavaScript. They are preserved as a tiny binary shell type
 * so reads return ordinary objects and never crash the storage ritual.
 */

const Packet = require('../packet.js');
const TYPE = require('../typeNames.js');

/**
 * @function isOpaqueObject
 * @description
 * Detects standard objects whose inner slots cannot be enumerated or cloned.
 *
 * @param {*)} value - Incoming value.
 * @returns {boolean} True when the value should become an opaque shell.
 */
function isOpaqueObject(value) {
  if (!value || typeof value !== 'object') return false;
  if (value instanceof WeakMap || value instanceof WeakSet || instanceOfPromise(value)) return true;
  return !!(globalThis.Intl && value instanceof Intl.DateTimeFormat);
}

function instanceOfPromise(value) {
  return value instanceof Promise;
}

/**
 * @function encodeOpaqueObject
 * @description Encodes an unserializable object as a compact individual type.
 *
 * @param {*} value - Incoming value.
 * @returns {PrimitivePacket|null} Encoded packet or null.
 */
function encodeOpaqueObject(value) {
  if (!isOpaqueObject(value)) return null;

  const name = value.constructor && value.constructor.name
    ? value.constructor.name
    : 'Object';

  const raw = Buffer.from(name, 'utf8');
  return new Packet(TYPE.OPAQUE, raw, {
    sourceBytes: 0,
    storedBytes: raw.length
  });
}

module.exports = encodeOpaqueObject;
