B"H

# Post-Implementation Report

## What changed

Added pure Node.js tooling only:

- `compile/model-plan-compiler.js`
- `bin/compile-model-plan.js`
- `bin/probe-memory-timing.js`
- `bin/gate-50ms-100mb.js`

Rewrote runtime benchmark/timing files:

- `decode/chat-loop.js`
- `decode/token-runner.js`
- `bin/bench-chat.js`

No external compiler, package install, download, clang, gcc, MSVC, CMake, node-gyp, or npm path was invoked.

## Generated artifact

Command:

`node bin/compile-model-plan.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db`

Result:

- `ok:true`
- artifact: `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtai-db/runtime-cache/model-plans/bd6025acbdb1404cad876d4a.json`
- bytes: `66085`
- tensors: `201`
- layers: `22`
- `externalCompilerInvoked:false`

This is a real custom compiler artifact: manifest and tensor metadata are transformed into a deterministic static execution plan using only Node built-ins.

## Baseline gate before fixes

Command:

`node bin/gate-50ms-50mb.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db "Hello"`

Result:

- `ok:false`
- `msPerToken:62501.780412`
- `rss:442519552`
- `rssMb:422.01953125`
- text: newline

## Probe findings

Command:

`node --expose-gc bin/probe-memory-timing.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db`

Important memory marks:

- start RSS: `44171264`
- after tokenizer RSS: `51245056`
- after streamer RSS: `51412992`
- after first projection RSS: `52867072`
- after one token RSS: `447787008`
- after cleanup/GC RSS: `131497984`

Important timing:

- one token: `6295.563799 ms`
- LM-head fallback in probe: `677.635861 ms`
- many FFN layers: roughly `130-299 ms` each
- many attention blocks: roughly `28-107 ms` each

Conclusion: startup can fit under 100 MB, but one real token through the current mapped route touches enough model pages and allocates enough transient data to blow RSS far above the gate.

## Corrected 100 MB gate, mmap/native route

Command:

`node bin/gate-50ms-100mb.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db "Hello"`

After enabling mapped attention output projection in benchmark mode:

- `ok:false`
- `msPerToken:76364.075902`
- `rss:425480192`
- `rssMb:405.76953125`
- generated count: `1`
- `externalCompilerInvoked:false`

Measured blocker:

- mmap/native route remains over RSS by about 320 MB.
- It is also about 1500x slower than the 50 ms/token gate when wall time includes prompt prefill.
- The generated-token segment alone was still `6804.285313 ms`.

## Low-RSS file-window route

Command:

`AWTAI_PROMPT_TOKENS=1 AWTAI_FILE_PROJECT=1 AWTAI_NATIVE_MODEL_MAP=0 AWTAI_MAPPED_PROJECT_ADD=0 node bin/gate-50ms-100mb.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db "Hello"`

Result:

- `ok:false`
- `msPerToken:93634.555592`
- `rss:69804032`
- `rssMb:66.5703125`
- generated count: `1`
- `externalCompilerInvoked:false`

This route proves RSS below 100 MB is achievable, but the price is catastrophic latency. The biggest sections were per-layer FFN and attention, with several FFN layers above 3-5 seconds.

## Hard conclusion

The current codebase now has honest tooling for the mission gate, but it does not pass:

- fastest observed route in this pass: thousands of ms/token and over 400 MB RSS
- low-RSS observed route: 66.57 MB RSS but 93.63 seconds/token

The precise blocker is not tokenizer, manifest parsing, or tensor index overhead. The blocker is the available execution route tradeoff:

- mmap/native route touches too much of the 432 MB model and RSS exceeds the hard gate.
- file-window route avoids RSS growth but pays huge per-projection I/O/kernel overhead.
- the current JS-orchestrated per-layer dispatch cannot approach `<=50 ms/token`.

Next required engineering route:

1. Generate a lower-RSS execution runner that does not mmap the full model into the measured process.
2. Avoid per-projection file open/window overhead by compiling packed per-layer execution artifacts.
3. Fuse whole-layer execution, especially FFN and attention output, into a runner that streams packed weights once per layer.
4. Move beyond JS per-layer orchestration if the generated runner still measures above 50 ms/token.

No success is claimed.
