// B"H
const { dotQuantizedRow, rowByteLength } = require('../kernels/quant-row-dot.js');
const { rowsCols } = require('../tensors/tensor-shape.js');
const { insertTopK } = require('./direct-topk-insert.js');

/**
 * Direct quantized LM-head top-k in pure repo JavaScript.
 *
 * The old low-RAM path built a massive F32 slab and then searched it.  This
 * path reads quantized row windows, dots each row, and keeps only top-k.  The
 * vocabulary sea stays packed on disk while only a handful of logits are kept.
 */
function directQuantTopK(ctx, tensor, input, k) {
  const { rows, cols } = rowsCols(tensor);
  const bytesPerRow = rowByteLength(tensor.type, cols);
  const rowsPerWindow = directWindowRows();
  const best = [];
  for (let start = 0; start < rows; start += rowsPerWindow) {
    scanWindow(ctx, tensor, input, best, k, start, Math.min(rowsPerWindow, rows - start), bytesPerRow, cols);
  }
  if (ctx.stats) ctx.stats.event('direct-js-lm-head-topk', { rows, k, bytesPerRow });
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

module.exports = { directQuantTopK };
