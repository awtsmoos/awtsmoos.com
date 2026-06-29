B"H

# Three-phase plan before source changes

## Phase 1 — inspect before touching source
Files/directories to read first:
- `decode/chat-loop.js`
- `decode/token-runner.js`
- `execution/attention-step.js`
- `execution/ffn-step.js`
- `execution/lm-head.js`
- `attention/full-attention.js`
- `kv/*`
- `runtime/tensor-index.js`
- `tensors/tensor-shape.js`
- `format/ggml-types.js`
- `storage/*`
- `math/*`
- `kernels/quant-row-dot.js`
- `kernels/matvec-stream.js`
- `execution/embedding.js`
- `attention/rope.js`
- `geelooy/apps/awtsmoos-gguf/worker_src/*`
- `ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/c_compiler/*`

Evidence to collect:
- AWTAI manifest metadata relevant to tokenizer/chat template.
- Existence of clang/cmake/llama-cli/main.
- Current full-prompt one-token output and timing.

## Phase 2 — tokenizer and prompt proof
Actual files likely to write:
- `tools/tokenize-prompt.js` if no existing equivalent exists.
- Possibly `decode/prompt-template.js` if metadata proves chat template is required.
- Possibly rewrite `chat-loop.js` to call the proven template and stream tokens.

No silent guessing: script must print metadata values and token IDs.

## Phase 3 — native kernel proof
Actual files likely to write only after inspection:
- `native/awtai_quant_dot.h`
- `native/awtai_quant_dot.c`
- `native/build.sh`
- `native/native-matvec.js`
- Possibly split helpers under `native/` if a file would exceed 120 lines.

Kernel scope:
- Start with Q2_K because model is Q2_K and existing JS oracle is available.
- Keep API broad enough for Q3_K/Q4_K/Q5_K/Q6_K/Q8_0/F16/F32, but do not pretend all are proven until tests run.

## Phase 4 — verification gate
Commands to run:
- `command -v llama-cli; command -v main; find /Users/awtsmoos -maxdepth 5 ...`
- Full prompt with `AWTAI_MAX_NEW=1 AWTAI_MAX_RAM_KV=16` and `/usr/bin/time -l`.
- Success target with `AWTAI_MAX_NEW=32 AWTAI_STREAM=1 AWTAI_MAX_RAM_KV=64` only after correctness improves.

## Refusal to fake victory
If the output is non-English, Cyrillic fragments, repeated punctuation, or no output, final report must say failure exactly.
