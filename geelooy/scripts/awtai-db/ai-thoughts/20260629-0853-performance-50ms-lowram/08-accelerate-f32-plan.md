# B"H

# Accelerate F32 Projection Plan

## Goal

Find a way bigger speed lever than pthread management.

Current custom quant dot kernels are scalar C. Even after fused FFN and thread experiments, token pass time remains thousands of milliseconds. The next question is whether disposable dequantized temp weights plus macOS Accelerate can project much faster.

## Constraint

No `.awtai-db` v2. The canonical model file remains unchanged. Any dequantized weights are runtime/temp/cache artifacts only.

## This pass

Add a native function:

```js
projectF32Rows(weightsF32, rows, cols, inputF32)
```

Native side uses Accelerate / BLAS `cblas_sgemv` for row-major matrix-vector multiply.

## Files to add/rewrite

Add:

- `native/awtai_f32_project.h`
- `native/awtai_f32_project.c`
- `bin/bench-f32-project.js`

Rewrite fully:

- `native/addon.c`
- `native/native-matvec.js`
- `native/build.sh`

## Benchmark

For one tensor, compare:

1. current native quant projection from packed Q2_K/QK bytes
2. JS dequant once to Float32Array
3. native Accelerate projection from Float32Array

If F32 projection is much faster, the next runtime step is a disposable layer/window dequant cache:

```text
.awtai-db -> temp F32/F16 layer slabs -> Accelerate project -> delete temp
```

This may use large temp disk but bounded RAM.
