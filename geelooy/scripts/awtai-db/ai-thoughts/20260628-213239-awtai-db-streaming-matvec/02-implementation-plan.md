B"H

# Implementation plan after inspection

## Files to rewrite fully
- `storage/awtai-file.js`: expose tensor absolute offset and safe tensor range reads.
- `tensors/tensor-streamer.js`: expose `range()` while preserving `raw()` and `float()`.
- `kernels/matvec-stream.js`: replace full-matrix dequant with row-streaming projection.
- `kernels/quant-row-dot.js`: new small module for row byte sizing and row dot products.
- `attention/rope.js`: rewrite readable NeoX split-half RoPE.
- `tokenizer/gguf-tokenizer.js`: rewrite readable SentencePiece-style tokenizer implementation.
- `math/dequant.js`: rewrite readable dequant facade/kernels enough to remove compressed style.

## Verification gates
1. Syntax-load rewritten modules with Node.
2. Run small synthetic tests.
3. Run real AWTAI prompt with max RSS measurement.
4. Report coherent/not coherent honestly.

## Known limitation accepted in this pass
The new matvec stream path dequants only one row at a time. That is not the final fastest quantized kernel, but it removes full-matrix Float32 materialization and is a correct bridge toward direct block dot kernels.
