B"H

# AWTAI-DB real chat mission — reality map

## User truth that governs this pass
- Do not claim success until `What is Kabbalah? Answer simply.` produces coherent English streaming output.
- Current bad outputs include `кет` and `MDb квітemoibőlaal листо`.
- Existing JS direct quant row dots have been verified against the JS dequant oracle for Q2_K/Q3_K/Q4_K/Q6_K, but the full model is still not correct enough for chat.
- The next useful work is evidence-first: inspect current runtime, verify prompt/tokenizer/template, then add a native fast path only where measurements prove it helps.

## Immediate evidence already observed in this pass
- Tunnel `awt-awtsmoos-15582` is connected to `/Users/awtsmoos/Documents/awtsmoos` with command and write access.
- Project tree exists at `git/awtsmoos.com/geelooy/scripts/awtai-db`.
- Prior verification report says tensor-level raw quant projection matched dequant oracle on `blk.0.attn_q.weight` with max diff `1.4561980510308103e-8`.
- `real-chat.js` now defaults to full prompt because `AWTAI_PROMPT_TOKENS` is optional.
- `chat-loop.js` currently encodes raw prompt directly; no chat template evidence has been applied there yet.

## Work graph
1. Inspect execution path: attention, FFN, lm-head, matvec streaming, tensor shapes, storage.
2. Inspect metadata/tokenizer evidence: chat template, token ids, bos/eos/unk, add-space/add-bos flags.
3. Run a full-prompt one-token measurement without `AWTAI_PROMPT_TOKENS`.
4. If output is garbage or slow, isolate whether failure is prompt formatting/tokenizer/runtime math.
5. Build a small C kernel proof only after the data shape and runtime call site are clear.
6. Integrate native path only with fallback and explicit logs.
7. Run the success command and report exact output, token IDs, runtime, memory, and coherence.

## First hypothesis ladder
- Most likely correctness risks before speed: prompt template, tokenizer special/add flags, tensor orientation, attention GQA layout, RoPE, FFN order, lm-head orientation.
- Most likely speed bottleneck: JS quant dot scalar loops and per-projection tensor reads.
- Native C kernels are useful only if the JS path is already semantically correct enough to produce sane logits.

## Completion gate
The gate is not code compiled. The gate is coherent streamed English from the specified prompt. Anything else remains incomplete.
