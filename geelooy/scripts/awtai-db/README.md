B"H
# AWTAI-DB Engine Prototype

This runner is disk-first: model bytes live in `*.awtai-db`, tensor reads are range-based, and the low-RAM chat path avoids a full F32 LM-head slab.

## Convert
`node geelooy/scripts/awtai-db/bin/convert.js model.gguf model.awtai-db`

## Inspect
`node geelooy/scripts/awtai-db/tests/test-model-inspect.js model.awtai-db`

## Fastest measured low-RAM chat path
Use the generic direct quantized LM-head scanner. It does not build the old F32 slab and keeps tensor byte cache at zero:

```sh
AWTAI_TENSOR_CACHE_BYTES=0 \
AWTAI_JS_DIRECT_LM_HEAD=1 \
AWTAI_COMPILED_LM_HEAD=0 \
AWTAI_MAX_RAM_KV=1 \
AWTAI_MAX_NEW=2 \
node geelooy/scripts/awtai-db/bin/real-chat.js model.awtai-db "Hello"
```

## Optional pure-JS generated LM-head kernel
The repo can generate a deterministic CommonJS Q6_K LM-head scanner with Node built-ins only. No C compiler, npm package, or native build is used.

```sh
node geelooy/scripts/awtai-db/bin/compile-js-kernels.js model.awtai-db
AWTAI_COMPILED_LM_HEAD=1 AWTAI_JS_DIRECT_LM_HEAD=1 node geelooy/scripts/awtai-db/bin/real-chat.js model.awtai-db "Hello"
```

Current measurement on the TinyLlama Q2_K `.awtai-db`: the generated Q6_K scanner matched direct top-k parity and reduced RSS/read-event count in an isolated 1-token benchmark, but it was slower than the generic direct scanner. Therefore it is opt-in, not the default fastest path.

## Benchmark
```sh
AWTAI_BENCH_MODES=compiled,direct AWTAI_MAX_NEW=1 AWTAI_PROMPT_TOKENS=1 node geelooy/scripts/awtai-db/bin/bench-chat.js model.awtai-db "Hello"
```

## JS-only tests
```sh
node geelooy/scripts/awtai-db/tests/run-js-only-tests.js
node geelooy/scripts/awtai-db/tests/test-compiled-lm-head.js model.awtai-db
```
