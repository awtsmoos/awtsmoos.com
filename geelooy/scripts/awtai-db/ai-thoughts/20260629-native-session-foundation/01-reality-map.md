# B"H

# Native Session Foundation — Reality Map

## Observed project shape

The `.awtai-db` runtime lives at `geelooy/scripts/awtai-db`.

Observed hot path files:

- `decode/token-runner.js` runs every token from JS.
- `execution/attention-step.js` performs RMSNorm, q/k/v projection, RoPE, KV append, attention, output projection, residual.
- `execution/ffn-step.js` already uses native fused FFN when possible.
- `kernels/matvec-stream.js` owns projection routing and keeps `projectFileRows` optional through `AWTAI_FILE_PROJECT`.
- `native/addon.c` exposes projection, optional file-window projection, fused FFN, f32 projection, and mmap LM-head top-k.
- `storage/awtai-file.js` defines the AWTAI container header: magic `AWTDB001`, 16-byte header, manifest length at byte 8, tensor payload after manifest.

## Current gap

Native code owns kernels, not the decode runtime. JS still orchestrates each layer and each projection. The next safe step is not to rewrite attention math immediately. The next step is native model ownership: one persistent native handle can mmap the `.awtai-db` file once, validate the container, expose immutable model metadata, and later become the owner of tensor descriptors, KV, and session scratch.

## First implementation slice

Add a small native model map module:

- `native/awtai_model_map.h`
- `native/awtai_model_map.c`

Expose N-API methods:

- `openModelMap(path)` returns an external handle plus metadata.
- `closeModelMap(handle)` releases it.

Add JS wrapper:

- extend `native/native-matvec.js` with `nativeOpenModelMap`, `nativeCloseModelMap`, and status flags.

Update build:

- include `awtai_model_map.c` in `native/build.sh`.

## Why this step

This establishes the correct ownership boundary without disturbing correctness. The existing runtime remains default, `projectFileRows` remains opt-in, and the new native object becomes the place where future layer descriptors, KV cache, scratch arenas, and one-call decode will live.
