// B"H

const fs = require('fs');
const path = require('path');
const { rmsNormInto } = require('../kernels/rms-norm.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { dequant } = require('../math/dequant.js');
const { elements, rowsCols } = require('../tensors/tensor-shape.js');
const { rowByteLength } = require('../kernels/quant-row-dot.js');
const { nativeProjectF32Rows, nativeMmapF32TopK } = require('../native/native-matvec.js');

/** Final norm and vocabulary head: ordinary logits or low-RAM native top-k. */
function logits(ctx, x) {
  const h = normalized(ctx, x);
  const head = ctx.index.role('lm_head');
  if (useF32Head()) {
    const f32 = lmHeadF32(ctx, head);
    const { rows, cols } = rowsCols(head);
    const out = nativeProjectF32Rows(f32, rows, cols, h);
    if (out) return out;
  }
  return projectTensor(ctx.streamer, head, h, ctx.trace, 'lm-head');
}

function lmHeadTopK(ctx, x, k) {
  if (!useMmapHead()) return null;
  const head = ctx.index.role('lm_head');
  const { rows, cols } = rowsCols(head);
  const slab = lmHeadSlabPath(ctx, head, rows, cols);
  const top = nativeMmapF32TopK(slab, rows, cols, normalized(ctx, x), k, mmapWindowRows());
  return top ? Array.from(top) : null;
}

function normalized(ctx, x) {
  const norm = ctx.streamer.float(ctx.index.name('output_norm.weight'));
  const h = new Float32Array(ctx.config.hidden);
  rmsNormInto(h, x, norm, ctx.config.eps);
  return h;
}

function lmHeadF32(ctx, tensor) {
  if (ctx.f32LmHead) return ctx.f32LmHead;
  ctx.f32LmHead = dequant(ctx.streamer.raw(tensor), tensor.type, elements(tensor));
  return ctx.f32LmHead;
}

function lmHeadSlabPath(ctx, tensor, rows, cols) {
  if (ctx.mmapLmHeadPath && fs.existsSync(ctx.mmapLmHeadPath)) return ctx.mmapLmHeadPath;
  const filePath = path.join(ctx.scratch, 'lm-head.f32');
  const fd = fs.openSync(filePath, 'w');
  const bytesPerRow = rowByteLength(tensor.type, cols);
  const chunkRows = Number(process.env.AWTAI_LM_HEAD_SLAB_ROWS || 64);
  try {
    for (let row = 0; row < rows; row += chunkRows) {
      const count = Math.min(chunkRows, rows - row);
      const raw = ctx.streamer.range(tensor, row * bytesPerRow, count * bytesPerRow);
      const f32 = dequant(raw, tensor.type, count * cols);
      fs.writeSync(fd, Buffer.from(f32.buffer, f32.byteOffset, f32.byteLength));
      if (ctx.stats) ctx.stats.dequant(raw.length, `${tensor.name}:slab`);
    }
  } finally {
    fs.closeSync(fd);
  }
  ctx.mmapLmHeadPath = filePath;
  ctx.mmapLmHeadBytes = fs.statSync(filePath).size;
  return filePath;
}

function useF32Head() { return /^(1|true|yes)$/.test(String(process.env.AWTAI_F32_LM_HEAD || '')); }
function useMmapHead() { return /^(1|true|yes)$/.test(String(process.env.AWTAI_MMAP_LM_HEAD || '')); }
function mmapWindowRows() { const n = Number(process.env.AWTAI_MMAP_LM_WINDOW_ROWS); return Number.isFinite(n) && n > 0 ? Math.floor(n) : 512; }

module.exports = { logits, lmHeadTopK };
