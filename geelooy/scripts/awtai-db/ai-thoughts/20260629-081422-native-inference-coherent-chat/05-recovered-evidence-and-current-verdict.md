# B"H

# Recovered Evidence and Current Verdict

## Runtime prompt evidence
The native awtai-db runtime generated coherent English for multiple prompts using TinyLlama Q2_K.

### What is Kabbalah?
Generated text:

```text
Kabbalah is a religious and philosophical system that originated in
```

This came from 16 generated tokens with `ropeIsNeox:false`, `headDim:64`, `heads:32`, `kvHeads:4`, `layers:22`, `hidden:2048`, `eps:~1e-5`.

### Who are you?
Generated text:

```text
The question "Who are you?" is a common and
```

### Write one sentence.
Generated text:

```text
The sun is setting over the lake, casting a golden
```

### Hello.
Generated text:

```text
Sure! Here's a revised version of
```

The `Hello.` continuation is odd for a plain greeting but grammatical and model-like. It points more toward chat-template/sampling/context behavior than catastrophic transformer math.

## Reference source comparison

### llama.cpp LLaMA source
Read from:

`/Users/awtsmoos/Documents/awtsmoos/third_party/llama.cpp/src/models/llama.cpp`

Observed order:

1. token embedding
2. attention RMSNorm
3. Q/K/V projections
4. RoPE applied to Q/K with `ggml_rope_ext`
5. attention + output projection
6. residual add
7. FFN RMSNorm
8. FFN with up/gate/down using SiLU parallel gate
9. residual add
10. output RMSNorm
11. LM head

This matches the native awtai-db high-level execution order.

### Old browser GGUF worker
Read files:

- `worker_src/config.js`
- `worker_src/math_pos.js`
- `worker_src/model_attn.js`
- `worker_src/model_block.js`
- `worker_src/model_ffn.js`

Observed agreement:

- Default `rope_is_neox:false` for llama, true for Gemma.
- Non-NeoX rotates adjacent pairs `(2i, 2i+1)`.
- Attention uses Q/K/V projection, RoPE Q/K, KV cache, GQA mapping `floor(h / ratio)`, scaling `1/sqrt(head_dim)`, softmax, weighted V, output projection.
- Block order is pre-norm attention, residual, pre-norm FFN, residual.
- FFN is gate/up projections, activation on gate, multiply by up, down projection.

## Current technical verdict
The original handoff observation that output stops at only `Kabbalah` is stale for the currently inspected runtime. The current runtime already produces coherent multi-token text on several prompts. No proven transformer-math mismatch has been found yet.

## Remaining work
This is not fully closed until:

1. Longer generations are tested, ideally 32-64 new tokens.
2. Greedy native output is compared against llama.cpp on the original GGUF if that GGUF is available.
3. GGUF metadata and tensor shapes are dumped again in a stable command window.
4. Tokenizer encode/decode is tested against llama.cpp tokenizer if executable/model are available.
5. The `Hello.` odd continuation is investigated as possible chat-template/sampler/training-distribution issue.

## No source patch made
No runtime source file was modified in this pass. The evidence does not yet justify a patch.
