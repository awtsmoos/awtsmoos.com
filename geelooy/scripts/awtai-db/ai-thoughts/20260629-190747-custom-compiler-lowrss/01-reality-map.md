B"H

# Reality Map

Local repo is available directly at `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtai-db`; no tunnel failure was observed in this run.

Model files are present under `/Users/awtsmoos/Documents/awtai-db-models`, including `TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db` at about 432 MB.

Current runtime shape:

- `.awtai-db` reader parses a JSON manifest and reads tensor byte ranges through `storage/awtai-file.js`.
- `decode/chat-loop.js` constructs tokenizer, tensor index, streamer, KV cache, optional native attention session, then calls `runToken`.
- `decode/token-runner.js` loops through every layer in JS and dispatches attention, FFN, final norm, LM-head, and sampler.
- `execution/attention-step.js` can use mapped native RMSNorm, mapped QKV projection, native attention, and mapped output projection add.
- `execution/ffn-step.js` can use mapped native RMSNorm and mapped fused FFN.
- `execution/lm-head.js` can use direct quantized JS top-k, native F32 slab paths, or generic logits.
- `native/awtai_native.node` exists and is allowed as an already-present artifact for comparison/use.
- The custom native builder under `awtsmoos/compiling/native/rawCAddonBuilder.mjs` refuses external compilers unless explicitly opted in; this must remain true.

Main unresolved reality:

- The hard target is `<=50 ms/token` and `<=100 MB RSS`.
- Prior measured state was seconds/token and about 400 MB RSS.
- Node/V8 baseline RSS plus addon/model mapping may itself threaten the 100 MB gate, so measurement must isolate startup, manifest, tokenizer, model map, tensor access, one layer, LM-head, and one token.
