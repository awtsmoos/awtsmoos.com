// B"H
const path = require('path');
const { cacheKey, COMPILER_VERSION } = require('./cache-key.js');
const { repoRoot } = require('./cache-dir.js');
const { rowByteLength } = require('../kernels/quant-row-dot.js');
const { rowsCols } = require('../tensors/tensor-shape.js');

/**
 * The compiler does not trust prophecy.  It validates the tensor as it stands
 * now, in this file, with these bytes, before it dares emit one JS scanner.
 */
function buildLmHeadPlan(ctx, tensor) {
  if (!ctx || !ctx.file || !ctx.file.file) throw new Error("B'H missing file ctx");
  if (!tensor || tensor.type !== 14) return null;
  const shape = rowsCols(tensor);
  const stride = rowByteLength(tensor.type, shape.cols);
  const expected = stride * shape.rows;
  if (expected !== tensor.byteLength) throw new Error(`B'H bad LM-head bytes ${expected} != ${tensor.byteLength}`);
  const f16Path = path.join(repoRoot(), 'math', 'f16.js');
  const offset = ctx.streamer ? ctx.streamer.offset(tensor) : ctx.file.tensorOffset(tensor);
  const key = cacheKey({ fileSize: ctx.file.file.size, tensor: tensor.name, type: tensor.type,
    dims: tensor.dims, byteLength: tensor.byteLength, awtaiOffset: tensor.awtaiOffset,
    dataOffset: ctx.file.dataOffset, offset, f16Path });
  return { key, version: COMPILER_VERSION, type: tensor.type, name: tensor.name,
    rows: shape.rows, cols: shape.cols, stride, byteLength: tensor.byteLength, f16Path };
}

module.exports = { buildLmHeadPlan };
