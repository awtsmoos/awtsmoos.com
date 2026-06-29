# B"H

# Phase Two Reference Plan

## Native files to inspect repeatedly
- `decode/chat-loop.js`
- `decode/prompt-template.js`
- `decode/token-runner.js`
- `runtime/chat-runner.js`
- `runtime/full-runner.js`
- `runtime/session.js`
- `runtime/tensor-index.js`
- `execution/attention-step.js`
- `execution/embedding.js`
- `execution/ffn-step.js`
- `execution/lm-head.js`
- `attention/rope.js`
- `attention/softmax.js`
- `kernels/rms-norm.js`
- `kernels/quant-row-dot.js`
- `math/dequant.js`
- `math/matvec.js`
- `native/*.c` and `native/*.h` relevant to matvec and Q2_K
- `tokenizer/*.js`
- `sampler/*.js`

## Old working browser GGUF files to inspect
- `geelooy/apps/awtsmoos-gguf/worker_src/config.js`
- `geelooy/apps/awtsmoos-gguf/worker_src/model_attn.js`
- `geelooy/apps/awtsmoos-gguf/worker_src/model_block.js`
- `geelooy/apps/awtsmoos-gguf/worker_src/model_ffn.js`
- `geelooy/apps/awtsmoos-gguf/worker_src/math_pos.js`

## External reference source
Search local filesystem for llama.cpp/ggml directories. If found, read the local source instead of relying on memory. Priority: RoPE, RMSNorm, attention, GQA/KV, FFN gate, quantized dot products, tokenizer, chat templates, EOS logic.

## Comparison products
- Equation delta table.
- Tensor shape and orientation table.
- GGUF metadata table.
- Runtime token/logit trace table.
- Native vs JS fallback vs old worker vs llama.cpp behavior table.
