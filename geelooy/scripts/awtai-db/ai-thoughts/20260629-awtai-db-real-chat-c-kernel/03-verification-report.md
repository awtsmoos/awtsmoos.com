B"H

# Verification report — native Q2_K pass did not reach coherent chat

## Files written in this pass
- `native/awtai_quant_q2k.h`
- `native/awtai_quant_q2k.c`
- `native/addon.c`
- `native/build.sh`
- `native/native-matvec.js`
- `kernels/matvec-stream.js`
- `decode/prompt-template.js`
- `decode/chat-loop.js`
- `decode/token-runner.js`
- `sampler/greedy.js`
- `telemetry/memory.js`
- `bin/real-chat.js`

All source files were rewritten whole-file, not patched in place.

## Native build evidence
`clang` and `cc` exist. `emcc`, `cmake`, `llama-cli`, and `main` were not found.

The native addon compiled with:
`geelooy/scripts/awtai-db/native/build.sh`

It loaded successfully:
`{"active":true,"error":null}`

The linker warned:
`ld: warning: -undefined dynamic_lookup may not work with chained fixups`

## Native Q2_K oracle evidence
Real tensor tested: `blk.0.attn_q.weight`.
- type: `10`
- rows: `2048`
- cols: `2048`
- checked rows: `128`
- max diff against existing JS direct row dot: `1.956090193988569e-8`
- bad rows: `0`

Conclusion: the narrow Q2_K native projection matches the existing JS direct-dot oracle for this tensor.

## Prompt/tokenizer evidence
Metadata exposes a chat template. The rendered prompt used by default is:
`<|user|>\nWhat is Kabbalah? Answer simply.</s>\n<|assistant|>`

With BOS enabled, prompt tokens were:
`[1,529,29989,1792,29989,29958,13,5618,338,20533,5521,801,29973,673,3763,21106,29879,29958,13,29966,29989,465,22137,29989,29958]`

With `AWTAI_NO_BOS=1`, prompt tokens were:
`[529,29989,1792,29989,29958,13,5618,338,20533,5521,801,29973,673,3763,21106,29879,29958,13,29966,29989,465,22137,29989,29958]`

The markers `<|user|>` and `<|assistant|>` are not single special ids in this tokenizer; they split into ordinary pieces.

## Measured runs

### Raw prompt, before native/template
Command omitted `AWTAI_PROMPT_TOKENS` correctly.
- generated: `[13]`
- decoded text: newline
- real time: `95.58s`
- max resident set size: `193945600`
- peak memory footprint: `95854592`
- coherent: no

### Chat template with BOS, native Q2_K
- generated: `[5521]`
- decoded text: `bal`
- read bytes: `8956850592`
- tensors read: `4977`
- real time: `170.96s`
- max resident set size: `179924992`
- peak memory footprint: `105340928`
- coherent: no

### Chat template without BOS, native Q2_K, top logits
- generated: `[29890]`
- decoded text: `b`
- top logits: `b`, `bal`, `sb`, `k`, `ak`, `bc`, `s`, `K`, `ba`, `as`
- read bytes: `8600727296`
- tensors read: `4778`
- real time: `162.95s`
- max resident set size: `178417664`
- peak memory footprint: `94662656`
- coherent: no

## Honest conclusion
The native Q2_K bridge works numerically against the current JS oracle and reduces some projection overhead, but the mission is still not complete. Real chat output is still not coherent English. The first-token distribution after the TinyLlama chat prompt is dominated by fragments like `b` and `bal`, so the next suspected bug is not only speed; likely correctness remains in tokenizer/template handling, tensor orientation, attention/RoPE/GQA layout, or output head/logit interpretation.

## Next work
1. Create a llama.cpp/metadata-compatible token oracle if possible, or inspect GGUF tokenizer/add-token handling more deeply.
2. Verify output head orientation and logits against a small dequant oracle for the last hidden vector.
3. Add timing counters around native vs JS projection fallback to prove every Q2_K projection uses native.
4. Investigate batched prefill or layer/tensor reuse, because one generated token still rereads about 8.6–9.0 GB for the templated prompt.
5. Do not run the 32-token streaming success command yet; at current speed it would be extremely slow and would stream garbage.
