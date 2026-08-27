
// B"H

/**
 * @file utils/smartPointer/shape.js
 * @chapter The Pointer Shape Is Gathered
 * @description
 * Normalizes every old and new pointer-call style into one clean object.
 */

/**
 * @function fromArgs
 * @description
 * Converts SmartPointer.encode arguments into a decoded pointer object.
 *
 * @param {*} first - Pointer object or numeric type.
 * @param {*} second - Offset when first is type.
 * @param {*} third - Length when first is type.
 * @param {*} fourth - Flags when first is type.
 * @returns {object} Normalized pointer shape.
 */
function fromArgs(first, second, third, fourth) {
  if (Buffer.isBuffer(first)) {
    return {
      seal: first
    };
  }

  if (first && typeof first === 'object') {
    return {
      type: first.type || first.valType || first.kind || 0,
      offset: first.offset || first.start || first.ptr || 0,
      length: first.length || first.size || 0,
      flags: first.flags || 0,
      blockId: first.blockId || first.block || 0
    };
  }

  return {
    type: first || 0,
    offset: second || 0,
    length: third || 0,
    flags: fourth || 0,
    blockId: 0
  };
}

/**
 * @function toPlain
 * @description
 * Ensures numeric pointer fields are safe.
 *
 * @param {object} ptr - Pointer shape.
 * @returns {object} Clean pointer.
 */
function toPlain(ptr) {
  return {
    type: Number(ptr.type || 0),
    offset: Number(ptr.offset || 0),
    length: Number(ptr.length || 0),
    flags: Number(ptr.flags || 0),
    blockId: Number(ptr.blockId || 0)
  };
}

module.exports = {
  fromArgs,
  toPlain
};
