B"H

# Verification report

## Implemented
- Added disk range reads in `storage/awtai-file.js`.
- Added `TensorStreamer.range()` in `tensors/tensor-streamer.js`.
- Added `kernels/quant-row-dot.js` for row byte sizing and row dequant dot product.
- Replaced `projectTensor()` full-matrix dequant with row-streaming projection in `kernels/matvec-stream.js`.
- Rewrote `attention/rope.js` readably with explicit LLaMA/NeoX split-half rotation.
- Rewrote `tokenizer/gguf-tokenizer.js` readably with SentencePiece merge queue logic.

## Verification performed
- Node syntax/module load passed for modified modules and existing `math/dequant.js`.
- Real tensor projection equivalence check passed on `blk.0.attn_q.weight`, type `10` / Q2_K, shape 2048 x 2048.
- Checked 8 rows against old full-dequant matvec. Max difference: `1.4561980510308103e-8`.

## Real prompt result
Command:
`AWTAI_MAX_NEW=8 AWTAI_MAX_RAM_KV=2 /usr/bin/time -l node geelooy/scripts/awtai-db/bin/real-chat.js "$HOME/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K.awtai-db" "What is Kabbalah? Answer simply."`

Result:
- No stdout.
- No stderr.
- Timed out at 240 seconds.
- Job was cancelled.
- Therefore: no coherent output was produced, and success is not claimed.

## Exact next bottleneck
The replacement removed full-matrix Float32 materialization, but `dotQuantizedRow()` still dequants each row into a temporary Float32Array and performs scalar JS dot products. That is correct enough to match old output, but still too slow for a real prompt. The next step is direct quant-block dot products for Q2_K/Q3_K/Q4_K/Q5_K/Q6_K/Q8_0, preferably with native/WASM/JIT kernels that consume row block bytes and the input vector without row Float32 allocation.

## Incomplete
- `math/dequant.js` remains functionally loaded but still needs a dedicated readability split/rewrite pass.
- Real coherent chat remains unproven.
