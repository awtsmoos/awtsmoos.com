# B"H

# Optimization Plan Before Code Changes

## Phase 1 — measure before changing
Measure separately:
- tensor read time
- native projection time
- JS fallback projection time
- attention time
- FFN time
- LM head time
- tokenizer/sample time
- per-layer cumulative time
- cache hit/miss bytes

## Phase 2 — prove bottleneck
Expected largest cost is projection matvec, especially repeatedly projecting Q/K/V/O/Gate/Up/Down plus LM head. But this must be proven from real timings.

## Phase 3 — likely architecture change
A 50 ms/token target likely needs one of these:

1. A native fused decode step for a whole layer, not one projection at a time.
2. Memory-mapped/prepacked temporary weight files optimized for streaming row dot products.
3. A low-RAM native scheduler that reads only one layer slab at a time but keeps packed metadata and hot pages.
4. Optional native top-k LM head fused with output projection so full logits array does not become JS overhead.
5. Native attention/KV cache path to avoid JS loops and allocations.

## Phase 4 — RAM policy
Keep RAM bounded by:
- no full model load
- bounded tensor cache default far below current 1.5 GiB limit
- use temp prepack file instead of RAM cache
- keep only current layer weights window in memory
- store KV as compact Float16/quantized pages if quality permits, otherwise Float32 temp pages

## Phase 5 — success tests
Run:
- 32-token decode after prefill
- record prompt tokens, generated ids, text, per-token ms, RSS, temp bytes
- compare coherent output to current runtime
- compare RAM to baseline and llama.cpp if possible

## No patch rule
Do not patch blindly. If a file must change, read the full file first and rewrite the whole file or split it into complete small modules.
