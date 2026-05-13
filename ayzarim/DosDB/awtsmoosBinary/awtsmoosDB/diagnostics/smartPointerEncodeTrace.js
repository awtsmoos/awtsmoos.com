
// B"H

/**
 * @file diagnostics/smartPointerEncodeTrace.js
 * @chapter The Crown Lost Its Old Name
 * @description
 * Current failure:
 *
 * MapNode.save()
 * -> SmartPointer.encode(...)
 * -> TypeError: SmartPointer.encode is not a function
 *
 * Root cause:
 * The rewritten SmartPointer module kept decode(), toBuffer(), getType(), and
 * resolve(), but older core modules still call SmartPointer.encode().
 *
 * Core rule:
 * Never remove old public engine names while refactoring internals.
 *
 * Fix:
 * SmartPointer.encode() is restored as a full compatibility method. It accepts:
 * - a decoded pointer object,
 * - type/offset/length/flags numeric arguments,
 * - or any compatible location object.
 *
 * It delegates to the underlying pointer crown when available, otherwise it
 * writes the stable 16-byte pointer seal directly.
 */

module.exports = {
  failingCall: 'SmartPointer.encode(...)',
  caller: 'structure/map/node.js:78',
  fix: 'restore SmartPointer.encode compatibility method'
};
