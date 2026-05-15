
// B"H

/**
 * @file structure/manifest/complex/builder/classifier.js
 * @chapter The Gatekeeper Before Structure
 * @description
 * Decides whether a value is primitive or structural. This prevents RegExp,
 * Date, Buffer, Function, Symbol, BigInt, ArrayBuffer, and typed arrays from
 * falling into dictionary storage.
 */

/**
 * @function isPrimitiveStorageValue
 * @description Checks whether the primitive scribe must handle the value.
 * @param {*} value - Incoming value.
 * @returns {boolean} True when primitive-scribe-owned.
 */
function isPrimitiveStorageValue(value) {
  if (value === null || value === undefined) return true;

  const type = typeof value;

  if (type !== 'object') return true;
  if (Buffer.isBuffer(value)) return true;
  if (value && value.__awtsmoosEncrypted === true) return true;
  if (value && value.__awtsmoosBlob === true) return true;
  if (value && value.__awtsmoosText === true) return true;
  if (value instanceof Error) return true;
  if (value instanceof Date) return true;
  if (value instanceof RegExp) return true;
  if (value instanceof WeakMap || value instanceof WeakSet || value instanceof Promise) return true;
  if (globalThis.Intl && value instanceof Intl.DateTimeFormat) return true;
  if (value instanceof ArrayBuffer) return true;
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) return true;

  return false;
}

module.exports = {
  isPrimitiveStorageValue
};
