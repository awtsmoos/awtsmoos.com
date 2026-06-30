B"H

# RAM Budget Plan

Hard budget: `104857600 bytes` absolute RSS.

Initial budget targets:

- Node/V8 + standard modules: measure, do not assume.
- Manifest and tokenizer: target below 25 MB incremental.
- Tensor index/plan: target below 5 MB incremental.
- Native addon + model map: measure separately; mapped pages count if RSS rises.
- Activations: keep reusable Float32Array buffers near hidden/ffn/qkv sizes and avoid per-stage retention.
- KV cache: one-token gate can use tiny RAM KV; longer runs must spill to disk.
- Tensor cache: default zero unless measurement proves a net win within RSS.
- LM-head: no full logits/materialized F32 slab in low-RSS gate.

Micro-probes to add:

- `start`
- `after-require-runtime`
- `after-open-file`
- `after-manifest`
- `after-tokenizer`
- `after-index`
- `after-streamer`
- `after-native-map`
- `after-first-tensor`
- `after-first-projection`
- `after-one-layer`
- `after-lm-head`
- `after-one-token`
- `after-cleanup-gc`

If bare Node plus required runtime exceeds 100 MB, the conclusion must be explicit and the next route must be a lower-RSS standalone runner using already-present native artifacts or repo-generated artifacts only.
