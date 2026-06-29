// B"H

const { rmsNormInto } = require('../kernels/rms-norm.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { dequant } = require('../math/dequant.js');
const { elements, rowsCols } = require('../tensors/tensor-shape.js');
const { nativeProjectF32Rows } = require('../native/native-matvec.js');

/**
 * Final norm and vocabulary head.
 *
 * The ordinary path projects packed quant rows.  The optional path dequants the
 * LM head once per process/chat into an F32 slab and lets Accelerate strike the
 * vocab gate.  It costs RAM, so it is opt-in: AWTAI_F32_LM_HEAD=1.
 */
function logits(ctx, x) {
  const { index, streamer, config, trace } = ctx;
  const norm = streamer.float(index.name('output_norm.weight'));
  const h = new Float32Array(config.hidden);
  rmsNormInto(h, x, norm, config.eps);
  const head = index.role('lm_head');
  if (useF32Head()) {
    const f32 = lmHeadF32(ctx, head);
    const { rows, cols } = rowsCols(head);
    const out = nativeProjectF32Rows(f32, rows, cols, h);
    if (out) return out;
  }
  return projectTensor(streamer, head, h, trace, 'lm-head');
}

function lmHeadF32(ctx, tensor) {
  if (ctx.f32LmHead) return ctx.f32LmHead;
  const raw = ctx.streamer.raw(tensor);
  ctx.f32LmHead = dequant(raw, tensor.type, elements(tensor));
  return ctx.f32LmHead;
}

function useF32Head() {
  const value = process.env.AWTAI_F32_LM_HEAD;
  return value === '1' || value === 'true' || value === 'yes';
}

module.exports = { logits };
