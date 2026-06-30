B"H

# Token-Latency Budget Plan

Hard budget: `<=50 ms/token`.

Rough per-token target:

- Embedding: <=1 ms.
- 22 transformer layers combined: <=44 ms, about <=2 ms/layer.
- Final norm + LM-head top-k + sampler: <=5 ms.

This is far below the existing JavaScript orchestration reality. The first useful result is not a cosmetic speedup; it is a timing breakdown that identifies the largest impossible segment.

Timing probes to add:

- tokenizer/render prompt
- embedding
- attention norm
- QKV projection
- RoPE/attention
- attention output projection/add
- FFN norm
- FFN fused/native or fallback
- final norm
- LM-head/top-k
- sampler
- per-layer total

Attack order after measurement:

1. Confirm mapped native QKV/FFN/attention are active.
2. Remove avoidable full tensor reads/dequantization from fallback paths.
3. Compile a static model plan to remove repeated lookup/shape logic.
4. Add a minimal pre-tokenized low-RSS runner mode for isolating inference.
5. If native kernel math itself is too slow, document the exact kernel/layer wall and design a deeper generated execution route.
