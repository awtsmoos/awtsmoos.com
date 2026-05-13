
// B"H

/**
 * @file diagnostics/smartPointerReadSizeTrace.js
 * @chapter The Map Node Needed The Crown's Breath-Length
 * @description
 * Current failure:
 *
 * structure/map/node.js
 * -> MapNode.load()
 * -> SmartPointer.readSize(buf, pStart)
 * -> TypeError: SmartPointer.readSize is not a function
 *
 * Real cause:
 * SmartPointer was rewritten without preserving the original public API.
 * The real original SmartPointer API had:
 *
 * encode(type, offset, length)
 * decode(buf, start)
 * readSize(buf, start)
 * getType(buf, start)
 * block(type, blockId, length, isChain, offset)
 * toBuffer(ptr)
 * resolve(ptrBuf, allocator, context)
 *
 * The map node stores variable-length pointer seals inside a packed node.
 * Therefore readSize() is not optional. It tells MapNode.load() how many bytes
 * to slice for each child/value pointer.
 *
 * Permanent fix:
 * Restore SmartPointer as a compatibility-safe facade over the original
 * variable-length pointer crown. Do not use fixed 16-byte fallback unless the
 * old crown cannot decode. The engine is varint-pointer based.
 */

module.exports = {
  failure: 'SmartPointer.readSize is not a function',
  caller: 'structure/map/node.js',
  fixedBy: 'restored full SmartPointer public API including readSize(buf,start)'
};
