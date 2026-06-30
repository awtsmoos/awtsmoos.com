B"H

# Benchmark Failure Map

Known previous measurements:

- Direct 2-token chat: about 44.5 s total, about 22.25 s/token, about 440 MB RSS.
- Compiled JS LM-head 2-token chat: about 48 s total, about 24 s/token, about 442 MB RSS.
- Isolated one-token direct path: about 3904 ms/token, about 400 MB RSS.
- Attempted `nativeFast`: about 5894 ms/token, about 409 MB RSS.

Current benchmark files:

- `bin/bench-chat.js` spawns `bin/real-chat.js` and reports wall time, parsed runtime memory trace, stats, cache, text, and logits.
- `bin/gate-50ms-50mb.js` is currently too narrow for this mission: it checks 50 MB, not 100 MB, and does not emit the full requested evidence fields.

Failure categories to re-measure:

- Absolute RSS at bare Node startup and after each load stage.
- Cost of native addon load and native model map.
- Manifest/tokenizer construction memory.
- Tensor index and tensor streamer memory.
- First tensor lookup and first projection memory.
- Layer timing split: embedding, attention norm, QKV, attention, output projection, FFN norm, FFN, final norm, LM-head, sampler.
- Whether native mapped paths are actually active under the benchmark env.
- Whether full LM-head or direct top-k dominates after native projection.

Pass/fail rule:

- Any result above `50 ms/token` fails.
- Any result above `104857600 bytes RSS` fails.
- A benchmark using fake inference, skipped layers, or external compiler/toolchain execution is invalid.
