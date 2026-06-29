// B"H

function number(meta, key, fallback) {
  const value = Number(meta[key]);
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Read the GGUF model hparams used by the runtime.
 *
 * The old Awtsmoos GGUF worker keeps LLaMA RoPE in adjacent-pair form and only
 * flips NeoX style on for Gemma.  This config now carries that flag explicitly,
 * so attention does not secretly rotate TinyLlama with the wrong geometry.
 */
function readModelConfig(manifest) {
  const m = manifest.metadata;
  const arch = m['general.architecture'] || 'unknown';
  const hidden = number(m, `${arch}.embedding_length`, number(m, 'llama.embedding_length', 0));
  const layers = number(m, `${arch}.block_count`, number(m, 'llama.block_count', 0));
  const heads = number(m, `${arch}.attention.head_count`, number(m, 'llama.attention.head_count', 1));
  const kvHeads = number(m, `${arch}.attention.head_count_kv`, number(m, 'llama.attention.head_count_kv', heads));
  const headDim = number(m, `${arch}.rope.dimension_count`, number(m, 'llama.rope.dimension_count', hidden / heads));
  return {
    arch,
    hidden,
    layers,
    heads,
    kvHeads,
    headDim,
    kvGroup: Math.max(1, heads / kvHeads),
    ffn: number(m, `${arch}.feed_forward_length`, number(m, 'llama.feed_forward_length', 0)),
    vocab: number(m, `${arch}.vocab_size`, number(m, 'llama.vocab_size', 0)),
    ctx: number(m, `${arch}.context_length`, number(m, 'llama.context_length', 2048)),
    eps: number(m, `${arch}.attention.layer_norm_rms_epsilon`, number(m, 'llama.attention.layer_norm_rms_epsilon', 1e-5)),
    ropeBase: number(m, `${arch}.rope.freq_base`, number(m, 'llama.rope.freq_base', 10000)),
    ropeScale: 1,
    ropeIsNeox: String(arch).toLowerCase().includes('gemma'),
  };
}

module.exports = { readModelConfig };
