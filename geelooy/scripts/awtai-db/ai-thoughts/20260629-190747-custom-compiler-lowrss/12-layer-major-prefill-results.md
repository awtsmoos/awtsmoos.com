B"H

# Layer-Major Prefill Results

## Implemented

- `TensorStreamer` now has a scoped byte cache.
- `token-runner` now exports `startToken` and `runLayer`.
- `chat-loop` prefill now runs layer-major by default.
- `AWTAI_LAYER_MAJOR_PREFILL=0` restores the old token-major order.

This is not prompt-answer caching. It still runs transformer math for the live
prompt, but it reads each layer's weights once per prefill rather than once per
prompt token.

## Correctness probe

With `AWTAI_PROMPT_TOKENS=2`, layer-major and token-major produced the same
top token:

- token id `29989`
- text `"|"`
- logit `14.958099683428351`

## Full-prompt live gate

Best old full-prompt rawCompiled:

- `msPerToken: 73048.701602`
- `rssMb: 124.8984375`
- `readBytes: 5746334208`
- `tensorsRead: 2526`

Layer-major rawCompiled, 4 threads:

- `msPerToken: 43001.506521`
- `rssMb: 130.7734375`
- `readBytes: 765663744`
- `tensorsRead: 370`

Layer-major rawCompiled, 16 threads:

- `msPerToken: 39858.089258`
- `rssMb: 113.87109375`
- `readBytes: 765663744`
- `tensorsRead: 370`

Constrained V8 heap:

- command included `NODE_OPTIONS=--max-old-space-size=32`
- `msPerToken: 77231.933736`
- `rssMb: 80.8671875`

## Conclusion

The repeated-read bottleneck was real and was reduced by about 7.5x in bytes
read. Latency improved from 73s/token to about 40s/token, but the remaining
blocker is compute inside repeated quantized projection and FFN calls.

The best current speed route still fails both gates:

- required `<= 50 ms/token`
- measured `39858.089258 ms/token`
- required `<= 100MB RSS`
- measured `113.87109375 MB RSS`

The best current RAM route passes RSS but fails latency catastrophically:

- measured `80.8671875 MB RSS`
- measured `77231.933736 ms/token`

The next required route is a true generated multi-token projection/FFN kernel or
a repo-owned Mach-O/WASM compiler path. Parameter tuning cannot close the
remaining roughly 800x latency gap.
