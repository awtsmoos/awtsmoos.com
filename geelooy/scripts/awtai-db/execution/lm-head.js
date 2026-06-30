// B"H

const { rmsNormInto } = require('../kernels/rms-norm.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { dequant } = require('../math/dequant.js');
const { elements, rowsCols } = require('../tensors/tensor-shape.js');
const { directQuantTopK } = require('../lm-head/direct-quant-topk.js');
const { nativeMappedRmsNorm, nativeProjectF32Rows, nativeMmapF32TopK } = require('../native/native-matvec.js');

/** Final norm and vocabulary head: JS direct top-k, native top-k, or logits. */
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
  const h = normalized(ctx, x);
  const head = ctx.index.role('lm_head');
  if (useDirectTopK()) return directQuantTopK(ctx, head, h, k);
  const native = nativeTopK(ctx, head, h, k);
  return native || null;
}

function nativeTopK(ctx, head, h, k) {
  if (!useMmapHead()) return null;
  const { rows, cols } = rowsCols(head);
  const slab = lmHeadSlabPath(ctx, head, rows, cols);
  const top = nativeMmapF32TopK(slab, rows, cols, h, k, mmapWindowRows());
  return top ? Array.from(top) : null;
}

function normalized(ctx, x) {
  const tensor = ctx.index.name('output_norm.weight');
  const mapped = mappedNorm(ctx, tensor, x);
  if (mapped) return mapped;
  const norm = ctx.streamer.float(tensor);
  const h = new Float32Array(ctx.config.hidden);
  rmsNormInto(h, x, norm, ctx.config.eps);
  return h;
}

function mappedNorm(ctx, tensor, x) {
  if (noNative()) return null;
  const map = ctx.streamer.nativeMap;
  if (!map || !tensor || typeof ctx.streamer.offset !== 'function') return null;
  const out = nativeMappedRmsNorm(map, { offset: ctx.streamer.offset(tensor), type: tensor.type }, ctx.config.hidden, x, ctx.config.eps);
  if (out && ctx.stats) ctx.stats.read(tensor.byteLength, `${tensor.name}:mapped-rms`);
  return out;
}

function lmHeadF32(ctx, tensor) {
  if (ctx.f32LmHead) return ctx.f32LmHead;
  ctx.f32LmHead = dequant(ctx.streamer.raw(tensor), tensor.type, elements(tensor));
  return ctx.f32LmHead;
}

function lmHeadSlabPath(ctx, tensor, rows, cols) {
  if (ctx.mmapLmHeadPath) return ctx.mmapLmHeadPath;
  const { createLmHeadSlab } = require('../lm-head/slab-writer.js');
  return createLmHeadSlab(ctx, tensor, rows, cols);
}

function useDirectTopK() {
  return /^(1|true|yes)$/.test(String(process.env.AWTAI_JS_DIRECT_LM_HEAD || process.env.AWTAI_NO_NATIVE || '0'));
}
function useF32Head() { return !noNative() && /^(1|true|yes)$/.test(String(process.env.AWTAI_F32_LM_HEAD || '')); }
function useMmapHead() { return !noNative() && /^(1|true|yes)$/.test(String(process.env.AWTAI_MMAP_LM_HEAD || '')); }
function noNative() { return /^(1|true|yes)$/.test(String(process.env.AWTAI_NO_NATIVE || '0')); }
function mmapWindowRows() { const n = Number(process.env.AWTAI_MMAP_LM_WINDOW_ROWS); return Number.isFinite(n) && n > 0 ? Math.floor(n) : 512; }

module.exports = { logits, lmHeadTopK };
