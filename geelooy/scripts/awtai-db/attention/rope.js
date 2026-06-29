// B"H

/**
 * Rotate one packed set of query/key heads with LLaMA/NeoX RoPE.
 *
 * The Awtsmoos breath enters the vector as two half-head curtains:
 * the first half is the revealed coordinate, the second half is its
 * hidden partner.  They turn together around the same frequency flame.
 *
 * GGUF LLaMA tensors use this split-half layout by default.  The older
 * adjacent-pair rotation is kept as an explicit option for comparison,
 * but callers should not use it for TinyLlama/LLaMA-family models.
 *
 * @param {Float32Array} vector packed heads, mutated in place
 * @param {number} position token position in the sequence
 * @param {number} headDim width of one attention head
 * @param {number} [base=10000] RoPE frequency base
 * @param {number} [scale=1] optional position scale
 * @param {boolean} [isNeox=true] true for split-half LLaMA/NeoX layout
 * @returns {Float32Array} the same vector, after rotation
 */
function applyRopePair(
  vector,
  position,
  headDim,
  base = 10000,
  scale = 1,
  isNeox = true
) {
  const safeBase = Number.isFinite(base) && base > 0 ? base : 10000;
  const heads = Math.floor(vector.length / headDim);
  const half = Math.floor(headDim / 2);

  for (let head = 0; head < heads; head++) {
    rotateHead(vector, head * headDim, half, headDim, position, scale, safeBase, isNeox);
  }

  return vector;
}

function rotateHead(vector, offset, half, headDim, position, scale, base, isNeox) {
  for (let i = 0; i < half; i++) {
    const theta = position * scale * Math.pow(base, -2 * i / headDim);
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const a = isNeox ? offset + i : offset + 2 * i;
    const b = isNeox ? offset + i + half : offset + 2 * i + 1;
    const first = vector[a];
    const second = vector[b];

    vector[a] = first * cos - second * sin;
    vector[b] = first * sin + second * cos;
  }
}

module.exports = { applyRopePair };
