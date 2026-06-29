// B"H
const { embedding } = require('../execution/embedding.js');
const { attentionStep } = require('../execution/attention-step.js');
const { ffnStep } = require('../execution/ffn-step.js');
const { logits } = require('../execution/lm-head.js');
const { greedy, topK } = require('../sampler/greedy.js');
const { applyRepetitionPenalty } = require('../sampler/repetition.js');

/**
 * Run one transformer token through every layer and optionally sample logits.
 *
 * Here the Awtsmoos speaks one glyph at a time.  The model may see the door of
 * `</s>` shining too early, so the caller can temporarily veil chosen token ids
 * while the first words are still being born.  The veil is not a lie; it is the
 * same practical covenant used by chat runtimes that enforce a minimum answer.
 */
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
  suppressTokens(out, ctx.suppressTokenIds);
  ctx.lastTopLogits = topK(out, ctx.topK || 10).map(item => ({ ...item, text: ctx.tokenizer.decode([item.id]) }));
  return greedy(out);
}

function suppressTokens(logits, ids) {
  if (!ids || !ids.length) return;
  for (const id of ids) {
    if (id >= 0 && id < logits.length) logits[id] = -Infinity;
  }
}

module.exports = { runToken };
