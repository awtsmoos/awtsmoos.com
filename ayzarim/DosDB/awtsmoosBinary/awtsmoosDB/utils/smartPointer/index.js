
// B"H

/**
 * @file utils/smartPointer/index.js
 * @chapter The Smart Crown With Every Public Name Present
 * @description
 * Strict SmartPointer facade over the one true varint pointer format.
 *
 * Public API is complete:
 * encode, decode, readSize, getType, getOffset, getLength, block, toBuffer,
 * fromBuffer, resolve.
 *
 * Format is complete:
 * [type:1 byte][offset:ULEB128][length:ULEB128]
 *
 * No missing methods.
 * No padding.
 * No fixed 16-byte ghosts.
 */

const Crown = require('../pointer/crown.js');
const normalize = require('./normalize.js');

/**
 * @class SmartPointer
 * @description
 * Complete varint pointer API.
 */
class SmartPointer {
  /**
   * @static
   * @method encode
   * @description
   * Encodes a pointer using the exact varint format.
   *
   * @param {*} first - Buffer, pointer object, or numeric type.
   * @param {number} [second] - Offset.
   * @param {number} [third] - Length.
   * @returns {Buffer} Minimal pointer seal.
   */
  static encode(first, second, third) {
    const ptr = normalize(first, second, third);
    if (ptr.seal) return ptr.seal;
    return Crown.encode(ptr.type, ptr.offset, ptr.length);
  }

  /**
   * @static
   * @method decode
   * @description
   * Decodes a pointer seal at optional start offset.
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
   * Reads exact varint pointer byte size.
   *
   * @param {Buffer} buf - Source buffer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Pointer byte size.
   */
  static readSize(buf, start = 0) {
    return Crown.readSize(buf, start);
  }

  /**
   * @static
   * @method getType
   * @description
   * Reads pointer type.
   *
   * @param {Buffer|object} buf - Pointer seal or decoded pointer.
   * @param {number} [start=0] - Start offset.
   * @returns {number} Type.
   */
  static getType(buf, start = 0) {
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
   * Legacy block bridge. blockId is treated as offset when offset is absent.
   *
   * @param {number} type - Type byte.
   * @param {number} blockId - Legacy block id.
   * @param {number} [length=0] - Byte length.
   * @param {boolean} [_isChain=false] - Ignored legacy flag.
   * @param {number} [offset=0] - Explicit offset.
   * @returns {Buffer} Pointer seal.
   */
  static block(type, blockId, length = 0, _isChain = false, offset = 0) {
    return this.encode(type, offset || blockId || 0, length || 0);
  }

  /**
   * @static
   * @method toBuffer
   * @description
   * Converts pointer object into pointer seal.
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
   * Decodes pointer seal.
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
   * Resolves pointer into scalar, native collection, or LiveHandle.
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

module.exports = SmartPointer;
