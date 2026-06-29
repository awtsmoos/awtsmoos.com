// B"H
const { embedding } = require('../execution/embedding.js');
const { attentionStep } = require('../execution/attention-step.js');
const { ffnStep } = require('../execution/ffn-step.js');
const { logits } = require('../execution/lm-head.js');
const { greedy } = require('../sampler/greedy.js');
const { applyRepetitionPenalty } = require('../sampler/repetition.js');
function runToken(ctx, token, pos, produceLogits = true) {
  let x = embedding(ctx.streamer, ctx.index.role('embed'), token);
  ctx.trace.mark(`after-embedding-pos-${pos}`);
  for (let layer = 0; layer < ctx.config.layers; layer++) {
    attentionStep(ctx, layer, x, pos);
    ffnStep(ctx, layer, x);
    ctx.stats.layers++;
    ctx.trace.mark(`after-layer-${layer}-pos-${pos}`);
  }
  if (!produceLogits) return null;
  const out = logits(ctx, x);
  applyRepetitionPenalty(out, ctx.generatedSoFar || []);
  return greedy(out);
}
module.exports = { runToken };
