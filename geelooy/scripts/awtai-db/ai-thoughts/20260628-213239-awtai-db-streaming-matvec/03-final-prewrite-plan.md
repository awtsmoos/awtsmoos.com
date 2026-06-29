B"H

# Final prewrite plan

## Actual code move
Reveal disk as the first memory hierarchy:

`AwtaiFile.tensorRangeBytes(tensor, offset, length)` -> `TensorStreamer.range(...)` -> `projectTensor()` streams each matrix row -> `dotQuantizedRow()` dequants only that row and accumulates.

## Why this is the right narrow pass
- It avoids full tensor Float32Array allocation immediately.
- It does not change the AWTAI converter or manifest format.
- It creates a clear seam where later direct Q2_K/Q3_K/Q4_K block-dot kernels can replace row dequant.
- It keeps correctness debuggable because row output can be compared to old full-dequant matvec.

## Files actually touched
- `storage/awtai-file.js`
- `tensors/tensor-streamer.js`
- `kernels/matvec-stream.js`
- `kernels/quant-row-dot.js`
- `attention/rope.js`
- `tokenizer/gguf-tokenizer.js`
- `math/dequant.js`

## After write
- Read back every touched file.
- Run syntax verification.
- Run conversion/chat tests that exist.
- Run real prompt with `/usr/bin/time -l` when available, otherwise `/usr/bin/time -v` or shell fallback.
