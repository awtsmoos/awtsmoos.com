// B"H
const { embedding } = require('../execution/embedding.js');
const { attentionStep } = require('../execution/attention-step.js');
const { ffnStep } = require('../execution/ffn-step.js');
const { logits, lmHeadTopK } = require('../execution/lm-head.js');
const { greedy, topK } = require('../sampler/greedy.js');
const { applyRepetitionPenalty } = require('../sampler/repetition.js');

function runToken(ctx, token, pos, produceLogits = true) {
  return timed(ctx, 'token-total', () => {
    const x = startToken(ctx, token, pos);
    for (let layer = 0; layer < ctx.config.layers; layer++) runLayer(ctx, layer, x, pos);
    return produceLogits ? timed(ctx, 'sample-next', () => sampleNext(ctx, x)) : null;
  });
}

function startToken(ctx, token, pos) {
  const x = timed(ctx, 'embedding', () => embedding(ctx.streamer, ctx.index.role('embed'), token));
  ctx.trace.mark(`after-embedding-pos-${pos}`);
  return x;
}

function runLayer(ctx, layer, x, pos) {
  timed(ctx, `layer-${layer}-attention`, () => attentionStep(ctx, layer, x, pos));
  timed(ctx, `layer-${layer}-ffn`, () => ffnStep(ctx, layer, x));
  ctx.stats.layers++;
  ctx.trace.mark(`after-layer-${layer}-pos-${pos}`);
  return x;
}

function sampleNext(ctx, x) {
  const nativeTop = timed(ctx, 'lm-head-topk', () => lmHeadTopK(ctx, x, ctx.topK || 10));
  if (nativeTop) return pickNative(ctx, nativeTop);
  const out = timed(ctx, 'lm-head-logits', () => logits(ctx, x));
  applyRepetitionPenalty(out, ctx.generatedSoFar || []);
  suppressTokens(out, ctx.suppressTokenIds);
  ctx.lastTopLogits = topK(out, ctx.topK || 10).map(withText(ctx));
  return greedy(out);
}

function pickNative(ctx, nativeTop) {
  const filtered = nativeTop.filter(item => !suppressed(ctx, item.id));
  const best = filtered[0] || nativeTop[0];
  ctx.lastTopLogits = filtered.map(withText(ctx));
  return best ? best.id : 0;
}

function timed(ctx, label, fn) {
  return ctx.timer ? ctx.timer.time(label, fn) : fn();
}

function withText(ctx) { return item => ({ ...item, text: ctx.tokenizer.decode([item.id]) }); }
function suppressed(ctx, id) { return (ctx.suppressTokenIds || []).includes(id); }
function suppressTokens(logits, ids) { if (ids) for (const id of ids) if (id >= 0 && id < logits.length) logits[id] = -Infinity; }

module.exports = { runToken, runLayer, startToken };
