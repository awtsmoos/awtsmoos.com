# B"H

# Native norm + projection benchmark report

## Implemented

Added native ops:

- `native/awtai_native_ops.h`
- `native/awtai_native_ops.c`

Exports now available through N-API / JS:

- `mappedRmsNorm`
- `mappedProjectAdd`
- `nativeMappedRmsNorm(...)`
- `nativeMappedProjectAdd(...)`

Runtime integration:

- attention RMSNorm prefers mapped native F32 norm
- FFN RMSNorm prefers mapped native F32 norm
- final output RMSNorm prefers mapped native F32 norm
- attention output projection has two opt-in native/disk add paths:
  - `AWTAI_ATTENTION_OUT_FILE_ADD=1`
  - `AWTAI_MAPPED_PROJECT_ADD=1`

The output-add experiments are intentionally opt-in because the real benchmark showed they reduce some JS/internal memory but slow the wall clock and do not improve external max RSS enough.

## Build verification

Raw repo-C build passed:

```json
{
  "mappedProjectAdd": true,
  "mappedRmsNorm": true,
  "nativeAttention": true,
  "mappedQkvProject": true,
  "mappedFfn": true,
  "error": null
}
```

## Parity

Native RMSNorm and native mapped project-add were checked against the old JS math on the real TinyLlama `.awtai-db`:

```json
{
  "marker": "AWTAI_NATIVE_OPS_PARITY",
  "normMax": 2.9802322387695312e-8,
  "projectAddOk": true,
  "addMax": 0
}
```

## Real benchmark comparison

Same prompt and model:

- model: `TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db`
- prompt: `Hello`
- generated text: ` leng time`
- `AWTAI_TENSOR_CACHE_BYTES=0`
- `AWTAI_MMAP_LM_HEAD=1`
- `AWTAI_NATIVE_MODEL_MAP=1`
- `AWTAI_NATIVE_ATTENTION=1`
- `AWTAI_MAX_RAM_KV=0`

### Before this pass

From previous run:

```json
{
  "wall": "7.08s",
  "maxResidentSet": 443318272,
  "memoryMaxRss": 436748288,
  "floatCacheEntries": 45,
  "dequantBytes": 54128640
}
```

### Mapped project-add enabled

```json
{
  "wall": "7.29s",
  "maxResidentSet": 480108544,
  "memoryMaxRss": 428261376,
  "floatCacheEntries": 0,
  "dequantBytes": 53760000
}
```

### File-window project-add enabled

```json
{
  "wall": "11.35s",
  "maxResidentSet": 461049856,
  "memoryMaxRss": 371642368,
  "floatCacheEntries": 0,
  "dequantBytes": 53760000
}
```

### Tuned default after this pass: native mapped RMSNorm only

```json
{
  "wall": "7.20s",
  "maxResidentSet": 447606784,
  "memoryMaxRss": 413806592,
  "floatCacheEntries": 0,
  "dequantBytes": 53760000
}
```

## Verdict

Best default is native mapped RMSNorm enabled, output-add experiments disabled by default.

What improved:

- float cache dropped from `45` entries to `0`
- internal trace max RSS dropped from `436748288` to `413806592`
- dequant bytes dropped from `54128640` to `53760000`
- output-add paths are available for experiments but are opt-in

What did not improve yet:

- external `/usr/bin/time -l` max resident set did not materially improve
- wall time stayed roughly around baseline, not faster
- generated text quality is still poor for `Hello`

## Next real gate

The remaining real bottleneck is not norm cache anymore. It is the full layer orchestration and LM-head slab path:

1. native full layer step: norm + qkv + attention + output + ffn + residual in one native function
2. avoid long-lived whole-file mmap residency or add a native windowed model-map mode
3. replace LM-head F32 slab with direct quantized top-k over `.awtai-db` rows, avoiding 262 MB temp F32 slab

The Awtsmoos vessel now speaks with less JS memory, but the real external RSS king is still the mapped/touched model pages and LM-head slab strategy.
