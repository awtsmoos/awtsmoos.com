B"H

# llama.cpp research continuation

## Web/source evidence
- Current llama.cpp/GGML quantization sources were checked online.
- The visible raw source exposed Q3_K dequant logic using `hmask`, packed `scales`, 12-byte unpacking via `kmask1/kmask2`, and 16-weight subgroups.
- Existing AWTAI `math/dequant.js` already mirrors that Q3_K layout closely.

## New plan
- Replace `quant-row-dot.js` row-dequant allocation with direct row dot functions.
- Cover the model-relevant K quants: Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, plus Q8_0/Q4_0/F16/F32 fallbacks.
- Keep `dequant()` only as oracle and for small vector tensors.
- Verify direct dot against `dequant(rowBytes)` for real tensors and synthetic input.
- Retry real prompt with one generated token first, then more only if it completes.

## Why this should help
The prior row-streaming path removed full matrix materialization but still allocated one Float32 row per matrix row. Direct dot removes millions of row allocations and lets later WASM/JIT replace the same function body.
