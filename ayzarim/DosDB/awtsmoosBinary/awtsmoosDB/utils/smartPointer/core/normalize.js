
// B"H

/**
 * @file utils/smartPointer/core/normalize.js
 * @chapter The Coordinates Become Straight
 * @description
 * Normalizes old and new SmartPointer call shapes.
 */

/**
 * @function normalizePointerArgs
 * @description
 * Converts SmartPointer.encode inputs into {type, offset, length}.
 *
 * @param {*} first - Pointer object, Buffer, or numeric type.
 * @param {*} second - Offset.
 * @param {*} third - Length.
 * @returns {object} Normalized pointer shape.
 */
function normalizePointerArgs(first, second, third) {
  if (Buffer.isBuffer(first)) {
    return {
      seal: first
    };
  }

  if (first && typeof first === 'object') {
    return {
      type: Number(first.type ?? first.valType ?? first.kind ?? 0),
      offset: Number(first.offset ?? first.start ?? 0),
      length: Number(first.length ?? first.size ?? 0)
    };
  }

  return {
    type: Number(first || 0),
    offset: Number(second || 0),
    length: Number(third || 0)
  };
}

module.exports = normalizePointerArgs;
