// B"H
const { ensureLmHeadKernel } = require('../compile/lm-head-compiler.js');

/**
 * Runtime bridge to the generated scanner. The measured scanner currently wins
 * memory/read-event shape but not wall time, so it is deliberately opt-in.
 */
function compiledQuantTopK(ctx, tensor, input, k) {
  if (!enabled()) return null;
  try {
    const kernel = ensureLmHeadKernel(ctx, tensor);
    if (!kernel || typeof kernel.scan !== 'function') return null;
    const out = kernel.scan(ctx.file.file.path, ctx.streamer.offset(tensor), input, k, {
      windowRows: windowRows(), maxRows: ctx.compiledTopKMaxRows
    });
    note(ctx, tensor, out);
    return out.top;
  } catch (error) {
    if (ctx.stats) ctx.stats.event('compiled-js-lm-head-fallback', { error: String(error.message || error) });
    if (/^(1|true|yes)$/.test(String(process.env.AWTAI_STRICT_JS_KERNELS || '0'))) throw error;
    return null;
  }
}

function note(ctx, tensor, out) {
  if (!ctx.stats) return;
  ctx.stats.read(out.readBytes, `${tensor.name}:compiled-topk-read`);
  ctx.stats.dequant(out.readBytes, `${tensor.name}:compiled-topk-dot`);
  ctx.stats.event('compiled-js-lm-head-topk', { rows: out.rows, stride: out.stride, key: out.key });
}

function enabled() {
  return /^(1|true|yes)$/.test(String(process.env.AWTAI_COMPILED_LM_HEAD || '0'));
}
function windowRows() {
  const n = Number(process.env.AWTAI_COMPILED_TOPK_ROWS || 128);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 128;
}

module.exports = { compiledQuantTopK };
