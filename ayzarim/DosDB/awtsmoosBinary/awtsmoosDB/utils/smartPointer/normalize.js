
// B"H

/**
 * @file utils/smartPointer/normalize.js
 * @chapter The Coordinates Are Made Straight
 * @description
 * Converts every valid SmartPointer input style into {type, offset, length}.
 */

/**
 * @function normalize
 * @description
 * Normalizes pointer arguments.
 *
 * @param {*} first - Buffer, pointer object, or numeric type.
 * @param {number} [second] - Offset.
 * @param {number} [third] - Length.
 * @returns {{seal?:Buffer,type?:number,offset?:number,length?:number}} Shape.
 */
function normalize(first, second, third) {
  if (Buffer.isBuffer(first)) {
    return {
      seal: first
    };
  }

  if (first && typeof first === 'object') {
    return {
      type: Number(first.type ?? first.valType ?? 0),
      offset: Number(first.offset ?? 0),
      length: Number(first.length ?? 0)
    };
  }

  return {
    type: Number(first || 0),
    offset: Number(second || 0),
    length: Number(third || 0)
  };
}

module.exports = normalize;
