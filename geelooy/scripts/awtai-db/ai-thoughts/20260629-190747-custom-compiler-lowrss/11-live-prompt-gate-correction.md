B"H

# Live Arbitrary Prompt Gate Correction

The earlier fastest measurements used `AWTAI_PROMPT_TOKENS=1`. That is not
acceptable for arbitrary prompts because it skips prompt prefill and conditions
generation only on the last selected prompt token.

## Code hardening

- `decode/chat-loop.js` now reports `promptTokensUsed`.
- `bin/bench-chat.js` propagates `promptTokensUsed`.
- `bin/gate-50ms-100mb.js` requires `promptTokensUsed === promptTokenCount`.
- `bin/bench-live-examples.js` deletes `AWTAI_PROMPT_TOKENS` before running.

## Corrected live failure

Command:

```sh
env -u AWTAI_PROMPT_TOKENS AWTAI_NO_PROFILE=1 AWTAI_MAX_NEW=1 \
  AWTAI_BENCH_MODES=rawCompiled AWTAI_THREADS=4 AWTAI_RSS_POLL_MS=500 \
  node bin/gate-50ms-100mb.js \
  /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db \
  Hello
```

Result:

- `ok: false`
- `promptTokenCount: 16`
- `promptTokensUsed: 16`
- `msPerToken: 73048.701602`
- `rss: 130965504`
- `rssMb: 124.8984375`
- `readBytes: 5746334208`
- `layers: 352`
- `externalCompilerInvoked: false`
- `text: "\n"`

The current live arbitrary-prompt path is therefore about 1460x slower than the
50ms/token gate and still above the 100MB RSS gate.

## Route comparison

Mapped native full-prompt route:

- `mode: nativeFast`
- `msPerToken: 76520.47177`
- `rss: 423784448`
- `rssMb: 404.15234375`
- `readBytes: 693934592`

This route reduces JS-side reads but fails RAM catastrophically because resident
mapped model pages count against RSS.

File-window low-RSS route was stopped after more than three minutes for one live
full-prompt token, so it is not a latency candidate.

## Current blocker

The real blocker is not prompt rendering or tokenization. It is repeated
full-transformer prompt prefill:

- 16 prompt tokens imply 15 prefill positions plus 1 generation position.
- 22 layers means 352 layer executions for this tiny prompt.
- Raw no-map route reads 5.75GB for one generated token.

Any valid route must compile or replace the repeated projection/FFN execution
path. LM-head-only work cannot reach the gate.
