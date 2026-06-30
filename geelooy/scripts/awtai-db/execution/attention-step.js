// B"H
const { rmsNormInto } = require('../kernels/rms-norm.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { addInto } = require('../kernels/add.js');
const { applyRopePair } = require('../attention/rope.js');
const { attend } = require('../attention/full-attention.js');
const { rowsCols } = require('../tensors/tensor-shape.js');
const { nativeAttentionStep, nativeMappedProjectAdd, nativeMappedRmsNorm, nativeProjectFileRows, nativeProjectMappedQkv, nativeProjectQkv } = require('../native/native-matvec.js');

/** One pre-norm attention block with mapped native norm and opt-in output add. */
function attentionStep(ctx, layer, x, pos) {
  const { index, streamer, config, trace } = ctx;
  const normTensor = index.name(`blk.${layer}.attn_norm.weight`);
  const h = mappedNorm(ctx, normTensor, x) || jsNorm(streamer, normTensor, x, config);
  const fused = tryNativeQkv(ctx, layer, h);
  const q = fused ? fused.q : projectTensor(streamer, index.role('attn_q', layer), h, trace, `L${layer}-q`);
  const k = fused ? fused.k : projectTensor(streamer, index.role('attn_k', layer), h, trace, `L${layer}-k`);
  const v = fused ? fused.v : projectTensor(streamer, index.role('attn_v', layer), h, trace, `L${layer}-v`);
  if (fused && trace) trace.mark(`after-native-qkv-${layer}`);
  const nativeAttn = tryNativeAttention(ctx, layer, pos, q, k, v);
  if (nativeAttn) return finishAttention(ctx, layer, x, nativeAttn, 'native');
  if (ctx.nativeAttention) throw new Error(`B'H native attention failed at layer ${layer}, pos ${pos}`);
  applyRopePair(q, pos, config.headDim, config.ropeBase, config.ropeScale, config.ropeIsNeox);
  applyRopePair(k, pos, config.headDim, config.ropeBase, config.ropeScale, config.ropeIsNeox);
  ctx.kv.append(layer, pos, k, v);
  return finishAttention(ctx, layer, x, attend(q, ctx.kv.get(layer), config), 'js');
}

function finishAttention(ctx, layer, x, attn, source) {
  const out = ctx.index.role('attn_out', layer);
  if (fileProjectAdd(ctx, out, attn, x)) {
    if (ctx.trace) ctx.trace.mark(`after-file-attn-out-${layer}-${source}`);
    return x;
  }
  if (mappedProjectAdd(ctx, out, attn, x)) {
    if (ctx.trace) ctx.trace.mark(`after-mapped-attn-out-${layer}-${source}`);
    return x;
  }
  addInto(x, projectTensor(ctx.streamer, out, attn, ctx.trace, `L${layer}-o`));
  if (ctx.trace && source === 'native') ctx.trace.mark(`after-native-attention-${layer}`);
  return x;
}

function fileProjectAdd(ctx, tensor, input, target) {
  if (/^(0|false|no)$/.test(String(process.env.AWTAI_ATTENTION_OUT_FILE_ADD || '0'))) return false;
  const file = ctx.streamer.file && ctx.streamer.file.file;
  if (!file || !file.path) return false;
  const shape = rowsCols(tensor);
  const out = nativeProjectFileRows(file.path, ctx.streamer.offset(tensor), tensor.type, shape.rows, shape.cols, input);
  if (!out) return false;
  addInto(target, out);
  if (ctx.stats) ctx.stats.read(tensor.byteLength, `${tensor.name}:file-add`);
  return true;
}

function mappedProjectAdd(ctx, tensor, input, target) {
  if (/^(0|false|no)$/.test(String(process.env.AWTAI_MAPPED_PROJECT_ADD || '0'))) return false;
  const shape = rowsCols(tensor);
  const map = ctx.streamer.nativeMap;
  if (!map || typeof ctx.streamer.offset !== 'function') return false;
  const ok = nativeMappedProjectAdd(map, { offset: ctx.streamer.offset(tensor), type: tensor.type, rows: shape.rows }, shape.cols, input, target);
  if (ok && ctx.stats) ctx.stats.read(tensor.byteLength, `${tensor.name}:mapped-add`);
  return ok;
}

function mappedNorm(ctx, tensor, x) {
  const map = ctx.streamer.nativeMap;
  if (!map || !tensor || typeof ctx.streamer.offset !== 'function') return null;
  const out = nativeMappedRmsNorm(map, { offset: ctx.streamer.offset(tensor), type: tensor.type }, ctx.config.hidden, x, ctx.config.eps);
  if (out && ctx.stats) ctx.stats.read(tensor.byteLength, `${tensor.name}:mapped-rms`);
  return out;
}

function jsNorm(streamer, tensor, x, config) {
  const norm = streamer.float(tensor);
  const h = new Float32Array(config.hidden);
  rmsNormInto(h, x, norm, config.eps);
  return h;
}

function tryNativeAttention(ctx, layer, pos, q, k, v) {
  if (!ctx.nativeAttention) return null;
  return nativeAttentionStep(ctx.nativeAttention, layer, pos, q, k, v, ctx.config);
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
