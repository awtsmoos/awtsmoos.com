
// B"H

/**
 * @file utils/smartPointer/index.js
 * @chapter The Variable Crown Restored Entirely
 * @description
 * This file restores the original SmartPointer public API while keeping the
 * newer central hydration work.
 *
 * CRITICAL:
 * MapNode.load() packs multiple pointer seals into one binary map node.
 * Therefore SmartPointer.readSize(buf,start) is part of the core database
 * format. Removing it breaks the engine immediately.
 *
 * Public API preserved:
 * - encode(type, offset, length)
 * - decode(buf, start)
 * - readSize(buf, start)
 * - getType(buf, start)
 * - block(type, blockId, length, isChain, offset)
 * - toBuffer(ptr)
 * - fromBuffer(buf, start)
 * - getOffset(buf, start)
 * - getLength(buf, start)
 * - resolve(ptrBuf, allocator, context)
 */

const Crown = require('./core/crownFacade.js');
const normalizePointerArgs = require('./core/normalize.js');
const Guard = require('./core/publicApiGuard.js');

/**
 * @class SmartPointer
 * @description
 * Variable-length pointer API used by the whole engine.
 */
class SmartPointer {
  /**
   * @static
   * @method encode
   * @description
   * Encodes pointer coordinates into a variable-length seal.
   *
   * @param {*} first - Pointer object, Buffer, or numeric type.
   * @param {number} [second] - Offset.
   * @param {number} [third] - Length.
   * @returns {Buffer} Pointer seal.
   */
  static encode(first, second, third) {
    const ptr = normalizePointerArgs(first, second, third);
    if (ptr.seal) return ptr.seal;
    return Crown.encode(ptr.type, ptr.offset, ptr.length);
  }

  /**
   * @static
   * @method decode
   * @description
   * Decodes a pointer seal from a buffer at optional start offset.
   *
   * @param {Buffer|object} buf - Pointer seal or decoded pointer.
   * @param {number} [start=0] - Start offset.
   * @returns {object|null} Decoded pointer.
   */
  static decode(buf, start = 0) {
    if (!buf) return null;
    if (!Buffer.isBuffer(buf)) return buf;
    return Crown.decode(buf, start);
  }

  /**
   * @static
   * @method readSize
   * @description
   * Reads the exact byte length of a variable pointer seal inside a larger
   * buffer.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Pointer seal byte size.
   */
  static readSize(buf, start = 0) {
    return Crown.readSize(buf, start);
  }

  /**
   * @static
   * @method getType
   * @description
   * Reads the pointer type byte.
   *
   * @param {Buffer|object} buf - Pointer seal or decoded pointer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} VAL_TYPE.
   */
  static getType(buf, start = 0) {
    if (!buf) return 0;
    if (!Buffer.isBuffer(buf)) return Number(buf.type || 0);
    return Crown.getType(buf, start);
  }

  /**
   * @static
   * @method getOffset
   * @description
   * Reads pointer offset.
   *
   * @param {Buffer|object} buf - Pointer seal or decoded pointer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Offset.
   */
  static getOffset(buf, start = 0) {
    const ptr = this.decode(buf, start);
    return ptr ? Number(ptr.offset || 0) : 0;
  }

  /**
   * @static
   * @method getLength
   * @description
   * Reads pointer length.
   *
   * @param {Buffer|object} buf - Pointer seal or decoded pointer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Length.
   */
  static getLength(buf, start = 0) {
    const ptr = this.decode(buf, start);
    return ptr ? Number(ptr.length || 0) : 0;
  }

  /**
   * @static
   * @method block
   * @description
   * Legacy bridge for older block-address style calls.
   *
   * @param {number} type - VAL_TYPE.
   * @param {number} blockId - Old block id or offset.
   * @param {number} [length=0] - Byte length.
   * @param {boolean} [_isChain=false] - Legacy ignored chain flag.
   * @param {number} [offset=0] - Preferred offset.
   * @returns {Buffer} Pointer seal.
   */
  static block(type, blockId, length = 0, _isChain = false, offset = 0) {
    return this.encode(type, offset || blockId || 0, length || 0);
  }

  /**
   * @static
   * @method toBuffer
   * @description
   * Converts decoded pointer object or seal into a Buffer seal.
   *
   * @param {object|Buffer} ptr - Pointer.
   * @returns {Buffer} Pointer seal.
   */
  static toBuffer(ptr) {
    return this.encode(ptr);
  }

  /**
   * @static
   * @method fromBuffer
   * @description
   * Alias for decode.
   *
   * @param {Buffer|object} buf - Pointer seal.
   * @param {number} [start=0] - Start offset.
   * @returns {object|null} Decoded pointer.
   */
  static fromBuffer(buf, start = 0) {
    return this.decode(buf, start);
  }

  /**
   * @static
   * @method resolve
   * @description
   * Resolves a pointer to scalar value or LiveHandle.
   *
   * @param {Buffer|object} ptrBuf - Pointer seal or decoded pointer.
   * @param {object} allocator - Allocator.
   * @param {object} context - Handle context.
   * @returns {*} Resolved value.
   */
  static resolve(ptrBuf, allocator, context) {
    const ptr = this.decode(ptrBuf);
    const resolveScalar = require('./resolveScalar.js');
    const value = resolveScalar(ptr, allocator);

    if (!value || value.isStructure !== true) return value;

    const HandleRegistry = require('../../core/registry/handle.js');

    return HandleRegistry.createHandle(
      allocator.db,
      this.toBuffer(ptr),
      ptr.type,
      context || {}
    );
  }
}

module.exports = Guard.verify(SmartPointer);
