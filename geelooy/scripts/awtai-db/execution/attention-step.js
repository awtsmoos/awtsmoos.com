// B"H
const { rmsNormInto } = require('../kernels/rms-norm.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { addInto } = require('../kernels/add.js');
const { applyRopePair } = require('../attention/rope.js');
const { attend } = require('../attention/full-attention.js');
const { rowsCols } = require('../tensors/tensor-shape.js');
const { nativeProjectMappedQkv, nativeProjectQkv } = require('../native/native-matvec.js');

/**
 * One pre-norm attention block.
 *
 * Fast path: persistent native mmap q/k/v projection from tensor offsets.
 * Fallbacks preserve the previous implementation exactly.  The raw qkv path is
 * opt-in only because low-RAM mode should not hold three tensor byte bodies in
 * JavaScript at once.
 */
function attentionStep(ctx, layer, x, pos) {
  const { index, streamer, config, trace } = ctx;
  const norm = streamer.float(index.name(`blk.${layer}.attn_norm.weight`));
  const h = new Float32Array(config.hidden);
  rmsNormInto(h, x, norm, config.eps);
  const fused = tryNativeQkv(ctx, layer, h);
  const q = fused ? fused.q : projectTensor(streamer, index.role('attn_q', layer), h, trace, `L${layer}-q`);
  const k = fused ? fused.k : projectTensor(streamer, index.role('attn_k', layer), h, trace, `L${layer}-k`);
  const v = fused ? fused.v : projectTensor(streamer, index.role('attn_v', layer), h, trace, `L${layer}-v`);
  if (fused && trace) trace.mark(`after-native-qkv-${layer}`);
  applyRopePair(q, pos, config.headDim, config.ropeBase, config.ropeScale, config.ropeIsNeox);
  applyRopePair(k, pos, config.headDim, config.ropeBase, config.ropeScale, config.ropeIsNeox);
  ctx.kv.append(layer, pos, k, v);
  const pages = ctx.kv.get(layer);
  const attn = attend(q, pages, config);
  const o = projectTensor(streamer, index.role('attn_out', layer), attn, trace, `L${layer}-o`);
  addInto(x, o);
  return x;
}

function tryNativeQkv(ctx, layer, h) {
  if (/^(1|true|yes)$/.test(String(process.env.AWTAI_FILE_PROJECT || ''))) return null;
  const parts = qkvParts(ctx, layer);
  if (!parts) return null;
  const mapped = tryMappedQkv(ctx, parts, h);
  if (mapped) return mapped;
  if (!/^(1|true|yes)$/.test(String(process.env.AWTAI_RAW_QKV || ''))) return null;
  return tryRawQkv(ctx, parts, h);
}

function qkvParts(ctx, layer) {
  const { index } = ctx;
  const qt = index.role('attn_q', layer), kt = index.role('attn_k', layer), vt = index.role('attn_v', layer);
  if (!qt || !kt || !vt) return null;
  const qShape = rowsCols(qt), kShape = rowsCols(kt), vShape = rowsCols(vt);
  if (qShape.cols !== kShape.cols || qShape.cols !== vShape.cols) return null;
  return { qt, kt, vt, qShape, kShape, vShape, cols: qShape.cols };
}

function tryMappedQkv(ctx, parts, h) {
  const { streamer } = ctx;
  if (!streamer.nativeMap || typeof streamer.offset !== 'function') return null;
  return nativeProjectMappedQkv(
    streamer.nativeMap,
    { offset: streamer.offset(parts.qt), type: parts.qt.type, rows: parts.qShape.rows },
    { offset: streamer.offset(parts.kt), type: parts.kt.type, rows: parts.kShape.rows },
    { offset: streamer.offset(parts.vt), type: parts.vt.type, rows: parts.vShape.rows },
    parts.cols,
    h
  );
}

function tryRawQkv(ctx, parts, h) {
  const { streamer } = ctx;
  return nativeProjectQkv(
    { raw: streamer.raw(parts.qt), type: parts.qt.type, rows: parts.qShape.rows },
    { raw: streamer.raw(parts.kt), type: parts.kt.type, rows: parts.kShape.rows },
    { raw: streamer.raw(parts.vt), type: parts.vt.type, rows: parts.vShape.rows },
    parts.cols,
    h
  );
}

module.exports = { attentionStep };
