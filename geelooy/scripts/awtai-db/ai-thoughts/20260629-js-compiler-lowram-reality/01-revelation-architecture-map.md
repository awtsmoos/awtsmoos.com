B"H

# Phase 1 Revelation Architecture Map

Observed tree: AWTAI DB runner is split into storage, tensors, kernels, execution, decode, tokenizer, sampler, native, stats, scratch, and tests.

Real files inspected before editing:
- storage/awtai-file.js: opens .awtai-db, reads header + JSON manifest, exposes tensorOffset, tensorBytes, tensorRangeBytes.
- storage/range-file.js: fd-backed read(offset,length) using fs.readSync and Buffer.allocUnsafe.
- tensors/tensor-streamer.js: owns byte cache and float cache; default cache supplied by chat-loop; range() reads disk windows; raw() reads full tensors.
- kernels/quant-row-dot.js: generic per-row quantized dot for F32/F16/Q4_0/Q8_0/Q2_K/Q3_K/Q4_K/Q5_K/Q6_K.
- kernels/matvec-stream.js: projectTensor uses nativeProjectFileRows only when AWTAI_FILE_PROJECT is enabled; otherwise raw() materializes the entire tensor and loops rows in JS or native addon.
- execution/attention-step.js: norm -> Q/K/V -> native attention if available -> output projection; JS fallback stores KV in JS/disk cache.
- execution/ffn-step.js: norm -> native mapped/raw fused FFN if available -> otherwise gate/up/down projected separately.
- execution/lm-head.js: final norm then direct quantized top-k when AWTAI_JS_DIRECT_LM_HEAD or AWTAI_NO_NATIVE is true; native mmap f32 optional; old f32 slab still reachable only with explicit env.
- lm-head/direct-quant-topk.js: scans quantized LM-head row windows and calls dotQuantizedRow per row, allocating subarray views per row and switching on type every row.
- decode/chat-loop.js: full chat prompt by default, native attention by default, scratch dir created, result exposes stats/memory; default tensor cache is still 1.5GB if env does not override.
- decode/token-runner.js: transformer loop; for top-k-only LM-head it picks greedy from returned top list without full repetition penalty.
- decode/prompt-template.js: hard-coded TinyLlama user-only renderer, not message-array aware.
- tokenizer/gguf-tokenizer.js + special-tokens.js: special tokens are preserved during encode.
- native/native-matvec.js: existing native addon may be used when present, but no new native build is allowed.

Model facts measured from the actual .awtai-db:
- 201 tensors.
- Config: llama, hidden=2048, layers=22, heads=32, kvHeads=4, ffn=5632, vocab=32000.
- Tensor types present: 14 Q6_K, 0 F32, 10 Q2_K, 11 Q3_K, 12 Q4_K.
- LM head output.weight is Q6_K, rows=32000, cols=2048, byteLength=53,760,000, offset=0.
- Chat template exists in metadata and matches TinyLlama-style <|user|>...eos...<|assistant|>.

Real baseline command:
AWTAI_TENSOR_CACHE_BYTES=0 AWTAI_JS_DIRECT_LM_HEAD=1 AWTAI_MAX_NEW=2 AWTAI_TOP_K=10 AWTAI_MAX_RAM_KV=1 node bin/real-chat.js model 'Hello'

Real baseline result:
- wall from /usr/bin/time -l: 49.47s real.
- external max RSS: 437,899,264 bytes.
- generated text: newline + S.
- mmapLmHeadBytes: 0.
- floatCacheEntries: 0.
- readBytes: 787,713,184.
- dequantBytes: 107,520,000.
- tensorsRead: 5141.
- layers: 374 because full chat template created 16 prompt tokens and the run generated 2 more tokens.

Immediate bottlenecks proven by code + benchmark:
1. Full chat prefill dominates wall: 17 token positions * 22 layers = 374 layer executions for a 2-token output.
2. JS path still materializes raw tensors for attention output projections when native/file add is not enabled.
3. LM-head direct top-k is low RAM but slow: it scans 53.76MB per generated token and uses a generic switch/subarray row loop.
4. Low-RAM defaults are unsafe: default tensor cache is 1.5GB unless env overrides it.
5. Response quality is not solved: correct template exists, but greedy generation yields newline + S for Hello.
