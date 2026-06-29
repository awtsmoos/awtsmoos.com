# B"H

# File-Window Projection Experiment

## What was implemented

Added an opt-in native projection path:

- `native/awtai_mmap_project.c` gained `awtai_mmap_quant_project`
- `native/addon.c` exposes `projectFileRows`
- `native/native-matvec.js` exposes `nativeProjectFileRows`
- `kernels/matvec-stream.js` can project directly from canonical `.awtai-db` file offsets when `AWTAI_FILE_PROJECT=1`
- `execution/ffn-step.js` avoids the fused raw-FFN path when file projection is enabled, so raw FFN tensors are not materialized in JS

## Why it was tried

The previous low-RAM run still allocated whole raw tensors into JS for projections. File-window projection maps packed quant bytes directly from the canonical `.awtai-db`, returning only projected Float32 vectors to JS.

## Native status

```json
{
  "active": true,
  "supported": [10, 11, 12, 14],
  "threads": 4,
  "fusedFfn": true,
  "f32Project": true,
  "mmapF32TopK": true,
  "projectFileRows": true,
  "error": null
}
```

## Full prompt gate attempt

Command:

```bash
cd /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com
/usr/bin/time -l node geelooy/scripts/awtai-db/bin/fast-lowram-sentence.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K.awtai-db "Write one sentence."
```

With `AWTAI_FILE_PROJECT=1` enabled by the CLI during the first attempt, the command was still running after more than two minutes. It was cancelled because it had already missed the 5-second gate by a wide margin and was slower than the previous 44.86s mmap-LM-head result.

## Decision

File-window per-tensor projection is useful as a memory experiment but is not a speed path. It removes JS raw tensor allocation, but it loses previous threaded/fused advantages and performs too many mmap/project calls. It must remain opt-in, not default.

## Next correct implementation

The next serious path is not per-tensor file windows. It is native fused layer execution:

1. one native call per layer
2. native reads/mmap all tensors for that layer
3. q/k/v/o and FFN are fused inside C
4. KV is native, not JS object/page structures
5. output token id only returns to JS

This is the actual road to below 50ms/word with low RAM.
