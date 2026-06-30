// B"H
const { dotQuantizedRow, rowByteLength } = require('../kernels/quant-row-dot.js');
const { rowsCols } = require('../tensors/tensor-shape.js');
const { insertTopK } = require('./direct-topk-insert.js');
const { compiledQuantTopK } = require('./compiled-topk.js');

/**
 * Direct quantized LM-head top-k.  First it asks the repo-owned JS compiler for
 * a model-specialized scanner; if that vessel cannot hold this tensor, the
 * generic row-dot path still walks the packed rows without a logits ocean.
 */
function directQuantTopK(ctx, tensor, input, k) {
  const compiled = compiledQuantTopK(ctx, tensor, input, k);
  return compiled || directQuantTopKFallback(ctx, tensor, input, k);
}

function directQuantTopKFallback(ctx, tensor, input, k) {
  const { rows, cols } = rowsCols(tensor);
  const bytesPerRow = rowByteLength(tensor.type, cols);
  const rowsPerWindow = directWindowRows();
  const limit = Math.min(rows, ctx.directTopKMaxRows || rows);
  const best = [];
  for (let start = 0; start < limit; start += rowsPerWindow) {
    const count = Math.min(rowsPerWindow, limit - start);
    scanWindow(ctx, tensor, input, best, k, start, count, bytesPerRow, cols);
  }
  if (ctx.stats) ctx.stats.event('direct-js-lm-head-topk', { rows: limit, k, bytesPerRow });
  return best;
}

function scanWindow(ctx, tensor, input, best, k, start, count, stride, cols) {
  const raw = ctx.streamer.range(tensor, start * stride, count * stride);
  if (ctx.stats) ctx.stats.dequant(raw.length, `${tensor.name}:direct-topk-dot`);
  for (let r = 0; r < count; r++) {
    const off = r * stride;
    const logit = dotQuantizedRow(raw.subarray(off, off + stride), tensor.type, cols, input);
    insertTopK(best, start + r, logit, k);
  }
}

function directWindowRows() {
  const n = Number(process.env.AWTAI_DIRECT_TOPK_ROWS || 16);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 16;
}

module.exports = { directQuantTopK, directQuantTopKFallback };
