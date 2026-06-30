# B"H

# Native projection-add and mapped norm plan

## Reality from the last real run

The real TinyLlama run worked, but telemetry showed remaining hot JS gates:

- `blk.*.attn_output.weight` still flowed through `projectTensor`.
- each output projection read and dequantized a large quantized tensor body through JS when `AWTAI_FILE_PROJECT` was off.
- norm weights are type `0` / F32, small but currently enter `TensorStreamer.float()` and remain in `floatCache`.
- native attention is already active, qkv is already mapped, FFN is already mapped.

## Specific native work for this pass

Add one new native module:

- `native/awtai_native_ops.h`
- `native/awtai_native_ops.c`

Functions:

- `awtai_project_add_from_base(...)`
  - validate mapped offset and tensor extent
  - project quantized mapped rows into a temporary small F32 vector
  - add directly into the residual target
  - removes raw JS tensor read and separate JS output projection buffer for attention output

- `awtai_rms_norm_f32_from_base(...)`
  - read F32 norm weights directly from the mapped `.awtai-db`
  - produce normalized hidden vector without `streamer.float()`

JS/native exports:

- `nativeMappedProjectAdd(...)`
- `nativeMappedRmsNorm(...)`

Runtime usage:

- attention norm uses mapped RMSNorm when available
- attention output uses mapped project-add when available
- FFN norm uses mapped RMSNorm when available
- final LM-head norm uses mapped RMSNorm when available

## Expected outcome

The next real chat run should have:

- fewer `attn_output.weight` raw tensor read/dequant events
- lower `readBytes`
- lower `dequantBytes`
- lower or similar RSS
- faster wall time
- `floatCacheEntries` closer to zero

## Honest caveat

This pass does not yet implement a full native layer step. It removes the largest remaining per-layer projection body crossing, but still leaves JS orchestration, embeddings, output projection scheduling, and LM-head slab creation.
