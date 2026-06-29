// B"H
const { rmsNormInto } = require('../kernels/rms-norm.js');
const { projectTensor } = require('../kernels/matvec-stream.js');
const { addInto } = require('../kernels/add.js');
const { applyRopePair } = require('../attention/rope.js');
const { attend } = require('../attention/full-attention.js');

/**
 * One pre-norm attention block.
 *
 * The query and key receive RoPE according to the model's own geometry.  LLaMA
 * in this project follows the old Awtsmoos GGUF worker's adjacent-pair rope;
 * Gemma may cross into NeoX split-half.  One wrong rotation is enough to turn
 * wisdom into punctuation, so the flag is carried explicitly from config.
 */
function attentionStep(ctx, layer, x, pos) {
  const { index, streamer, config, trace } = ctx;
  const norm = streamer.float(index.name(`blk.${layer}.attn_norm.weight`));
  const h = new Float32Array(config.hidden);
  rmsNormInto(h, x, norm, config.eps);
  const q = projectTensor(streamer, index.role('attn_q', layer), h, trace, `L${layer}-q`);
  const k = projectTensor(streamer, index.role('attn_k', layer), h, trace, `L${layer}-k`);
  const v = projectTensor(streamer, index.role('attn_v', layer), h, trace, `L${layer}-v`);
  applyRopePair(q, pos, config.headDim, config.ropeBase, config.ropeScale, config.ropeIsNeox);
  applyRopePair(k, pos, config.headDim, config.ropeBase, config.ropeScale, config.ropeIsNeox);
  ctx.kv.append(layer, pos, k, v);
  const pages = ctx.kv.get(layer);
  const attn = attend(q, pages, config);
  const o = projectTensor(streamer, index.role('attn_out', layer), attn, trace, `L${layer}-o`);
  addInto(x, o);
  return x;
}

module.exports = { attentionStep };
