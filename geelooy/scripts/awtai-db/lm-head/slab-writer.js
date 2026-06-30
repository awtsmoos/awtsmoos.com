// B"H
const fs = require('fs');
const path = require('path');
const { dequant } = require('../math/dequant.js');
const { rowByteLength } = require('../kernels/quant-row-dot.js');

/** Optional legacy slab writer, split out so JS-direct top-k avoids loading it. */
function createLmHeadSlab(ctx, tensor, rows, cols) {
  const filePath = path.join(ctx.scratch, 'lm-head.f32');
  const fd = fs.openSync(filePath, 'w');
  const stride = rowByteLength(tensor.type, cols);
  const chunkRows = slabRows();
  try {
    for (let row = 0; row < rows; row += chunkRows) writeChunk(ctx, tensor, fd, row, Math.min(chunkRows, rows - row), stride, cols);
  } finally { fs.closeSync(fd); }
  ctx.mmapLmHeadPath = filePath;
  ctx.mmapLmHeadBytes = fs.statSync(filePath).size;
  return filePath;
}

function writeChunk(ctx, tensor, fd, row, count, stride, cols) {
  const raw = ctx.streamer.range(tensor, row * stride, count * stride);
  const f32 = dequant(raw, tensor.type, count * cols);
  fs.writeSync(fd, Buffer.from(f32.buffer, f32.byteOffset, f32.byteLength));
  if (ctx.stats) ctx.stats.dequant(raw.length, `${tensor.name}:slab`);
}

function slabRows() {
  const n = Number(process.env.AWTAI_LM_HEAD_SLAB_ROWS || 64);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 64;
}

module.exports = { createLmHeadSlab };
