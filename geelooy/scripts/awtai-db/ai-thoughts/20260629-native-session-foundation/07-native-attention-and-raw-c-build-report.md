# B"H

# Native Attention + Raw C Build Report

## What changed

This pass moved the next hot part of the layer into native code and removed the remaining framework math dependency from the native addon build.

## No CMake / no external library build

Added a repo-owned raw C addon builder:

- `geelooy/scripts/awtsmoos/compiling/native/rawCAddonBuilder.mjs`

AWTAI now compiles via:

- `native/build-manifest.json`
- `native/build.sh`

The manifest lists raw `.c` files in the repo. The builder rejects non-C sources and sources that escape the native root. It resolves Node headers from the running Node executable and invokes the host C compiler directly. No CMake is used.

Removed Apple framework math use:

- `native/awtai_f32_project.c` now uses raw C row-major dot loops.
- `native/awtai_mmap_project.c` now uses raw C mmap LM-head dot loops.
- The raw builder no longer links `-framework Accelerate`.

## Native attention session

Added:

- `native/awtai_native_attention.h`
- `native/awtai_native_attention.c`

The native attention session owns per-layer K/V arrays. A native attention step now:

1. receives q/k/v projections
2. applies RoPE to q and k in C
3. appends rotated k and v to native KV
4. computes softmax attention in C
5. returns the attention output vector to JS

JS integration:

- `native/native-matvec.js` exports native attention wrappers.
- `decode/chat-loop.js` creates a native attention session only when capacity can cover the expected prompt + generated tokens.
- `execution/attention-step.js` uses native attention when the session exists; if native attention exists and fails, it throws instead of silently falling back to JS KV with missing history.

Controls:

```sh
AWTAI_NATIVE_ATTENTION=0
AWTAI_NATIVE_ATTENTION_TOKENS=1024
```

## Verification

Build command:

```sh
bash native/build.sh
```

Result:

- built `native/awtai_native.node`
- no CMake
- no framework math dependency
- existing macOS linker warning remains for Node dynamic lookup

Addon status:

```json
{
  "qkvProject": true,
  "mappedQkvProject": true,
  "fusedFfn": true,
  "mappedFfn": true,
  "nativeAttention": true,
  "f32Project": true,
  "mmapF32TopK": true,
  "modelMap": true,
  "error": null
}
```

Native attention parity against the existing JS RoPE + JS KV + JS attention path:

```json
{
  "marker": "AWTAI_NATIVE_ATTENTION_PARITY_RAW_C_BUILD",
  "maxDiff": 1.1920928955078125e-7,
  "reset": true
}
```

The remaining difference is normal float-order noise.

## What is now native in the hot path

- mapped q/k/v projection from model mmap offsets
- RoPE for q/k
- KV append for the native-attention path
- attention softmax/value mix
- mapped fused FFN
- mmap LM-head top-k

## Still not fully native

- output projection still returns through `projectTensor`
- residual add is still JS
- RMSNorm is still JS
- full token/layer loop is still JS
- native KV is RAM-resident with capacity gating, not yet mmap-spilled

## Real 50 ms/token status

No real `.awtai-db` model file was available in the project tree, so this pass cannot honestly certify 50 ms/token or one-tenth total RAM on TinyLlama. It does, however, remove the next confirmed JS/native boundary and object-heavy JS KV/attention segment, and it is parity-checked synthetically.

Next gate: native residual + RMSNorm + output projection folding, then a real model benchmark as soon as a model path exists.
