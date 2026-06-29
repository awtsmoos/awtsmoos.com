B"H

# AWTAI-DB streaming matvec continuation map

## Observed mission
- Continue the disk-first GGUF/AWTAI-DB inference path under `geelooy/scripts/awtai-db`.
- Preserve correctness over speed.
- Avoid full tensor dequantization for matrix-vector projections.
- Rewrite whole files only, with readable B"H source and strong JSDoc.
- Verify by running the real prompt: `What is Kabbalah? Answer simply.`

## Evidence already inspected
- `tokenizer/gguf-tokenizer.js` is functional-looking but compressed.
- `attention/rope.js` uses split-half NeoX by default, but is compressed.
- `math/dequant.js` contains real Q3_K instead of random noise, but is compressed.
- `kernels/matvec-stream.js` still reads a full tensor, fully dequants it, then performs a Float32 matvec.
- `tensors/tensor-streamer.js` exposes only whole-tensor reads and whole dequant.
- `storage/awtai-file.js` has only `tensorBytes(tensor)`, no range reader yet.
- Browser `worker_src/quant_k.js` still contains the old Q3_K random-noise stub; it is evidence of what not to reuse blindly.
- Browser `worker_src/math_wasm.js` allocates a 2GB shared heap, so it is not directly compatible with the low-RAM goal.

## First implementation direction
1. Add precise range reading to AWTAI storage and streamer.
2. Add quant block metadata helpers.
3. Add block dot-product helpers so matrix rows can be streamed without materializing the full matrix.
4. Replace `projectTensor()` with a disk-first row streaming path.
5. Preserve `dequant()` for small vectors, norms, embedding, and compatibility.
6. Split files if a source would become too long.

## Initial risk list
- Quant block row boundaries must match GGML block layout.
- Some tensors may use transposed dimensions or row-major assumptions.
- TinyLlama Q2_K can contain Q3_K tensors; Q3_K must be exact enough or output remains garbage.
- Streaming one row at a time may be correct but slow; correctness first.
- Coherent output may still fail because attention/tokenizer/format is incomplete.
