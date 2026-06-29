# B"H

# Accelerate F32 Results

## Goal

Find a larger speed lever than pthread orchestration by testing disposable dequantized F32 slabs plus macOS Accelerate SGEMV.

## Files added

- `native/awtai_f32_project.h`
- `native/awtai_f32_project.c`
- `bin/bench-f32-project.js`

## Files rewritten

- `native/addon.c`
- `native/native-matvec.js`
- `native/build.sh`
- `execution/lm-head.js`

## Native build

`build.sh` now links Accelerate:

```bash
-framework Accelerate
```

Build succeeded:

```text
B"H built /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtai-db/native/awtai_native.node
```

Native status from benchmark:

```json
{
  "active": true,
  "supported": [10, 11, 12, 14],
  "threads": 4,
  "fusedFfn": true,
  "f32Project": true,
  "error": null
}
```

## Tensor benchmark: blk.0.attn_q.weight

Shape:

```json
{
  "type": 10,
  "rows": 2048,
  "cols": 2048,
  "rawBytes": 1376256,
  "f32Bytes": 16777216
}
```

One-time JS dequant:

```text
60.708284 ms
```

Packed quant native projection:

```json
{
  "minMs": 6.704065,
  "medianMs": 7.027082,
  "maxMs": 860.333929
}
```

F32 Accelerate projection:

```json
{
  "minMs": 1.304076,
  "medianMs": 1.593986,
  "maxMs": 27.00891
}
```

Accuracy difference:

```json
{
  "maxAbs": 1.7695128917694092e-8,
  "maxIndex": 1280
}
```

Interpretation: after dequant, Accelerate F32 projection is about 4.4x faster by median for this tensor.

## Tensor benchmark: output.weight LM head

Shape:

```json
{
  "type": 14,
  "rows": 32000,
  "cols": 2048,
  "rawBytes": 53760000,
  "f32Bytes": 262144000
}
```

One-time JS dequant:

```text
1779.600796 ms
```

Packed quant native projection:

```json
{
  "minMs": 98.275026,
  "medianMs": 134.438596,
  "maxMs": 149.31013
}
```

F32 Accelerate projection:

```json
{
  "minMs": 19.172994,
  "medianMs": 28.931668,
  "maxMs": 474.109948
}
```

Accuracy difference:

```json
{
  "maxAbs": 1.0803341865539551e-7,
  "maxIndex": 721
}
```

Interpretation: after dequant, Accelerate F32 LM-head projection is about 4.6x faster by median, but the F32 slab is 250 MiB and dequant costs about 1.78s.

## Opt-in F32 LM-head chat test

Enabled by:

```bash
AWTAI_F32_LM_HEAD=1
```

Prompt:

```text
Write one sentence.
```

Output remained coherent and identical:

```text
\nThe sun is
```

Result:

```json
{
  "promptTokens": 19,
  "generatedTokens": 4,
  "tokenPasses": 22,
  "wallMs": 41409.711053,
  "msPerGeneratedToken": 10352.42776325,
  "msPerTokenPass": 1882.2595933181817,
  "maxRssMiB": 688.4140625,
  "readBytes": 409905600,
  "tensorsRead": 222,
  "layers": 484
}
```

This is similar to the older cached baseline, but RAM rises because the F32 LM head is resident in JS memory.

## Decision

F32/Accelerate is a real speed direction, but the current in-memory F32 LM-head cache is not the final low-RAM solution.

Next best architecture:

1. Dequant slabs to temp files, not JS heap.
2. Use mmap/windowed native reads for active projection slabs.
3. Accelerate projects from the active slab.
4. Keep only active layer or active head window resident.
5. Delete temp slabs after run.

This fits the user's rule: large temp files allowed, lower resident RAM required, no `.awtai-db` v2.

## Honest status

The road to 50ms/token is now clearer: use vectorized/Accelerate slabs. The current chat path still runs most layer projections through packed scalar quant kernels, so full token speed is not yet near 50ms.
