
// B"H

/**
 * @file utils/smartPointer/index.js
 * @chapter The Crown Of Address And Type
 * @description
 * SmartPointer is the small crown carried by every stored thing. It remembers
 * type, offset, length, and enough form to return the thing correctly.
 */

const Pointer = require('../pointer/crown.js');

/**
 * @class SmartPointer
 * @description
 * Pointer compatibility layer.
 */
class SmartPointer {
  /**
   * @static
   * @method decode
   * @description Decodes a pointer seal.
   * @param {Buffer|object} seal - Pointer seal or decoded pointer.
   * @returns {object|null} Decoded pointer.
   */
  static decode(seal) {
    if (!seal) return null;
    if (!Buffer.isBuffer(seal)) return seal;

    if (Pointer && typeof Pointer.decode === 'function') {
      return Pointer.decode(seal);
    }

    return {
      type: seal.readUInt8(0),
      offset: Number(seal.readBigUInt64BE(1)),
      length: Number(seal.readUInt32BE(9))
    };
  }

  /**
   * @static
   * @method toBuffer
   * @description Encodes a decoded pointer to a seal.
   * @param {object|Buffer} ptr - Pointer.
   * @returns {Buffer} Pointer seal.
   */
  static toBuffer(ptr) {
    if (Buffer.isBuffer(ptr)) return ptr;

    if (Pointer && typeof Pointer.encode === 'function') {
      return Pointer.encode(ptr.type, ptr.offset, ptr.length, ptr.flags || 0);
    }

    const b = Buffer.alloc(16);
    b.writeUInt8(ptr.type || 0, 0);
    b.writeBigUInt64BE(BigInt(ptr.offset || 0), 1);
    b.writeUInt32BE(ptr.length || 0, 9);
    return b;
  }

  /**
   * @static
   * @method getType
   * @description Gets pointer type without fully resolving.
   * @param {Buffer|object} ptr - Pointer.
   * @returns {number} Type.
   */
  static getType(ptr) {
    const decoded = this.decode(ptr);
    return decoded ? decoded.type : 0;
  }

  /**
   * @static
   * @method resolve
   * @description Resolves a pointer through central scalar/container hydration.
   * @param {Buffer|object} seal - Pointer seal.
   * @param {object} allocator - Allocator.
   * @param {object} ctx - Resolve context.
   * @returns {*} Resolved value.
   */
  static resolve(seal, allocator, ctx) {
    const ptr = this.decode(seal);
    const resolveScalar = require('./resolveScalar.js');
    const value = resolveScalar(ptr, allocator);

    if (!value || value.isStructure !== true) return value;

    const HandleRegistry = require('../../core/registry/handle.js');
    return HandleRegistry.createHandle(
      allocator.db,
      this.toBuffer(ptr),
      ptr.type,
      ctx || {}
    );
  }
}

module.exports = SmartPointer;
