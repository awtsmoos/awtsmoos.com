# B"H

# No external compiler, no npm, JS-only inference acceleration plan

## User correction

The user made the boundary absolute:

- no external compilers of any kind
- no npm modules
- all compiling / runtime improvement must be native JavaScript only
- split modules
- make chat token inference faster and lower RAM

## Immediate response

Do not add or invoke clang/gcc/MSVC/CMake/npm. Existing native code can remain in the tree as prior work, but this pass must improve the runtime without requiring any new native build.

## Real bottleneck from previous measurements

The current low-RAM path still uses this expensive LM-head route:

1. stream/dequant the quantized LM-head rows
2. write a large F32 slab to temp disk
3. call native mmap F32 top-k

For TinyLlama this creates roughly a 262 MB temporary F32 vocabulary slab. It helps speed compared with all-logits JS, but it costs disk, memory pressure, and native dependency.

## JS-only replacement

Add small modules:

- `lm-head/direct-topk-insert.js`
- `lm-head/direct-quant-topk.js`

Design:

- read only small row windows from `.awtai-db`
- use existing `dotQuantizedRow(...)` for each quantized row
- maintain top-k list only, not full vocab logits
- return `[{ id, logit }]`
- no F32 slab
- no native addon
- no compiler
- no npm

Update:

- `execution/lm-head.js`

Default behavior:

- if `AWTAI_JS_DIRECT_LM_HEAD=1` or `AWTAI_NO_NATIVE=1`, use direct JS top-k
- keep old native/slab path opt-in for old experiments only

## Benchmark plan

Run same real TinyLlama prompt:

```sh
AWTAI_NO_NATIVE=1
AWTAI_JS_DIRECT_LM_HEAD=1
AWTAI_TENSOR_CACHE_BYTES=0
AWTAI_MMAP_LM_HEAD=0
AWTAI_MAX_RAM_KV=0
AWTAI_MAX_NEW=2
```

Then compare:

- generated text
- wall time
- max resident set
- temp bytes / slab bytes
- streamer cache
- read/dequant bytes

## Honest expectation

This should reduce RAM and temp disk because the 262 MB F32 slab disappears. It may be slower than native F32 top-k until the row-dot kernels are further specialized. The next JS-only speed pass should specialize direct top-k for Q2_K / Q3_K model rows and optionally pre-score candidate chunks.
