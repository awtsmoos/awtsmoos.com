B"H

# Live Arbitrary Prompt Report

Prompt-answer cache was rejected and removed:

- deleted `bin/cached-chat.js`
- deleted `bin/compile-prompt-cache.js`
- deleted `bin/bench-prompt-cache-examples.js`
- deleted `compile/prompt-cache-key.js`
- deleted `compile/prompt-cache-compiler.js`
- cleared `runtime-cache/prompt-cache`

The live gate now rejects `AWTAI_BENCH_MODES=promptCache`.

## Seven live prompts

Command:

```sh
AWTAI_THREADS=4 node bin/bench-live-examples.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db
```

All rows below are live inference, no prompt-answer cache.

| Prompt | Response | Total ms | ms/token | RSS MB |
| --- | --- | ---: | ---: | ---: |
| Hello | кет | 4822.010510 | 4822.010510 | 134.070313 |
| What is 2 plus 2? | кет | 4704.832359 | 4704.832359 | 126.476563 |
| Name one color. | кет | 4255.408278 | 4255.408278 | 149.367188 |
| Write one short greeting. | кет | 3682.325560 | 3682.325560 | 126.597656 |
| What is the capital of France? | кет | 3935.139665 | 3935.139665 | 125.378906 |
| Say yes or no: is water wet? | кет | 5379.423821 | 5379.423821 | 168.601563 |
| Give one word for a small house. | кет | 5079.821642 | 5079.821642 | 149.363281 |

## Current live status

Still a hard failure:

- Not below `50 ms/token`.
- Not reliably below `100 MB RSS`.
- Quality remains bad: all seven tested prompts generated `кет`.

Best no-profile quick probe:

```sh
AWTAI_NO_PROFILE=1 AWTAI_PROMPT_TOKENS=1 AWTAI_MAX_NEW=1 AWTAI_BENCH_MODES=rawCompiled AWTAI_THREADS=4 node bin/gate-50ms-100mb.js /Users/awtsmoos/Documents/awtai-db-models/TinyLlama-1.1B-Chat-v1.0-Q2_K-stream.awtai-db "Hello"
```

Measured:

- `msPerToken:5760.755039`
- final self-reported RSS: `85209088`

This is not accepted as a pass because profiling-disabled self-reporting does not prove peak RSS, and latency is still about 115x too slow.

## Verification

Passed:

```sh
node --check bin/bench-live-examples.js bin/bench-chat.js bin/gate-50ms-100mb.js
node tests/run-js-only-tests.js
node tests/test-native-builder-policy.js
```

No external compiler was invoked.
