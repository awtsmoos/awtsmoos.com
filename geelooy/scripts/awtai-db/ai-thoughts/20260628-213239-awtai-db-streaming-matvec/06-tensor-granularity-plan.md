B"H

# Tensor-granularity streaming plan

## Evidence
After direct dot kernels, one BOS-only token still took ~79 seconds. Stats showed `tensorsRead: 426286`, meaning the runner now performs hundreds of thousands of tiny row reads. That preserves RAM but destroys throughput.

## Refined disk-first rule
Weights still stay on disk at model scale. For a projection, AWTAI may read exactly the current tensor into a transient byte buffer, consume it by direct row dots, then allow it to die. This is execution-order tensor streaming, not whole-model loading and not Float32 matrix materialization.

## Expected effect
- Read calls should drop from hundreds of thousands to hundreds.
- Float32 dequantized matrix allocation remains zero.
- Peak RAM rises by the largest current raw tensor only, likely acceptable for this TinyLlama probe.

## File to rewrite
- `kernels/matvec-stream.js`
