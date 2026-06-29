# B"H

# Performance Reality Map — 50 ms/token, low-RAM AWTAI inference

## New success gate
The goal is no longer only coherent chat. The target is:

- coherent TinyLlama chat
- around 50 ms per generated token
- much lower RAM than simply loading the model conventionally
- allowed to use large temporary files that are deleted after completion

## Current measured baseline from previous run
- `What is Kabbalah?` took about 117 seconds for 36 transformer token passes.
- That is about 3.25 seconds per full token pass.
- RSS was about 450 MiB for one run, and about 450-515 MiB across short runs.
- Tensor cache held about 391 MiB.

## Immediate implication
To reach 50 ms/token from ~3.25 s/token requires about a 65x speedup. This cannot come only from micro-optimizing JS loops. It needs a different execution strategy.

## Prime suspects for slowness
1. Reading/caching full projection tensors repeatedly.
2. Native matvec launching per tensor instead of fused per-layer execution.
3. JS orchestration overhead across hundreds of tensor projections.
4. No persistent prepacked temporary row/cache layout optimized for decoding.
5. LM head full vocab projection every token.
6. Output top-k computed after full logits, with full vocab matvec unavoidable unless approximate or staged.
7. Q2_K dot kernels are scalar and not ggml-grade vectorized.
8. Attention/KV still JS-level for every token.

## RAM target interpretation
The current Q2_K model file is already compressed. If "actual model" means unquantized fp16 TinyLlama, then 450-515 MiB RSS may already be far lower than full fp16 weights. If it means lower than llama.cpp Q2_K runtime, this must be measured directly.

## Allowed temporary files
Use temporary files for:
- decoded/prepacked layer slabs
- token-position KV pages
- precomputed row/scale offsets
- top-k partial reductions
- memory-mapped intermediate buffers

Temporary files must be deleted when the run closes.
