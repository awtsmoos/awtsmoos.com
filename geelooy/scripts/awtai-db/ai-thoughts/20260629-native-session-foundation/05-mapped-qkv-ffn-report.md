# B"H

# Mapped QKV + Mapped FFN Report

## Goal

Continue moving the runtime toward JavaScript-as-orchestration-only while reducing RAM pressure. The specific target of this pass was to stop moving q/k/v and FFN gate/up/down tensor byte bodies through JavaScript in the low-RAM path.

## Implemented

### Persistent native model map

`TensorStreamer` now opens one native model map by default when possible:

- `streamer.nativeMap`
- `streamer.offset(tensor)`
- `dispose()` closes the native map

This is controlled by:

- `AWTAI_NATIVE_MODEL_MAP=0` to disable

### Mapped q/k/v projection

Added native mapped qkv projection:

- `awtai_project_qkv_from_base(...)`
- addon export `projectMappedQkv(...)`
- JS wrapper `nativeProjectMappedQkv(...)`
- `attention-step.js` prefers mapped qkv when `streamer.nativeMap` exists

Raw qkv is now opt-in only:

- `AWTAI_RAW_QKV=1`

### Mapped FFN

Added native mapped FFN projection:

- `awtai_fused_ffn_from_base(...)`
- addon export `mappedFfn(...)`
- JS wrapper `nativeMappedFfn(...)`
- `ffn-step.js` prefers mapped FFN when `streamer.nativeMap` exists

Raw fused FFN is now opt-in only:

- `AWTAI_RAW_FFN=1`

## Verification

### Build and exports

`bash native/build.sh` passed.

`nativeStatus()` includes:

```json
{
  "qkvProject": true,
  "mappedQkvProject": true,
  "fusedFfn": true,
  "mappedFfn": true,
  "modelMap": true,
  "error": null
}
```

### Mapped QKV parity

Synthetic `.awtai-db` with q/k/v payloads:

```json
{
  "marker": "AWTAI_MAPPED_QKV_PARITY_DONE",
  "maxQ": 0,
  "maxK": 0,
  "maxV": 0,
  "closed": true
}
```

### Mapped QKV synthetic timing

Synthetic q/k/v with rows=2048, cols=2048, type=10, rounds=3:

```json
{
  "rawRes": {
    "label": "three nativeProjectRows calls",
    "perRoundMs": 59.570704,
    "rssDelta": 12689408
  },
  "mappedRes": {
    "label": "one mapped qkv call",
    "perRoundMs": 24.712424,
    "rssDelta": 4194304
  }
}
```

### Mapped FFN parity and timing

Synthetic FFN with hidden=512, ffn=1024, type=10, rounds=5:

```json
{
  "maxDiff": 0,
  "rawRes": {
    "label": "raw fused ffn",
    "perRoundMs": 7.6864588,
    "rssDelta": 1990656
  },
  "mappedRes": {
    "label": "mapped fused ffn",
    "perRoundMs": 3.4126748,
    "rssDelta": 24576
  }
}
```

## Current limitation

No real `.awtai-db` model file was found in the project tree, and a broad home search was stopped after no quick hits. Therefore, 50 ms/token and one-tenth-RAM claims cannot honestly be certified yet. The architecture slices are compiled and synthetic-tested, but real TinyLlama `.awtai-db` benchmarking still needs an actual model path.

## Next gate

The next meaningful step is a real-model run with:

```sh
AWTAI_NATIVE_MODEL_MAP=1 node bin/fast-lowram-sentence.js <model.awtai-db>
```

Then compare against:

```sh
AWTAI_NATIVE_MODEL_MAP=0 node bin/fast-lowram-sentence.js <model.awtai-db>
```

The expected next bottleneck after mapped qkv+ffn is JS attention/KV orchestration. The following architectural slice should move RoPE + KV append + attention decode into native session state.
