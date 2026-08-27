
// B"H

/**
 * @file diagnostics/smartPointerPublicApi.js
 * @chapter The Names That Must Never Break Again
 * @description
 * Public SmartPointer API that existing core files may call:
 *
 * SmartPointer.encode(...)
 * SmartPointer.decode(...)
 * SmartPointer.toBuffer(...)
 * SmartPointer.fromBuffer(...)
 * SmartPointer.getType(...)
 * SmartPointer.getOffset(...)
 * SmartPointer.getLength(...)
 * SmartPointer.resolve(...)
 *
 * The immediate crash came from structure/map/node.js using encode().
 */

module.exports = [
  'encode',
  'decode',
  'toBuffer',
  'fromBuffer',
  'getType',
  'getOffset',
  'getLength',
  'resolve'
];
