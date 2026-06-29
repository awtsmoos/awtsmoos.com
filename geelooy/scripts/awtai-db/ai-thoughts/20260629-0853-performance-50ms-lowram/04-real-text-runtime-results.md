# B"H

# Real Text Runtime Results

## Prompt

```text
Write one sentence.
```

Rendered prompt:

```text
<|user|>
Write one sentence.</s>
<|assistant|>
```

The test was deliberately short: 4 generated tokens, enough to prove real decoding while keeping repeated measurements survivable.

Generated text in both runs:

```text
The sun is
```

Raw decoded text contained a leading newline:

```text
\nThe sun is
```

Generated ids:

```json
[13, 1576, 6575, 338]
```

Prompt token count: 19  
Generated token count: 4  
Total transformer token passes: 22  
Layer executions: 484

## Run A — low RAM / no tensor cache

Options:

```json
{
  "tensorCacheBytes": 0,
  "maxRamKvTokens": 1,
  "spillKvToDisk": true,
  "deleteScratchOnClose": true,
  "maxNewTokens": 4
}
```

Results:

```json
{
  "wallMs": 127259.89428,
  "msPerGeneratedToken": 31814.97357,
  "msPerTokenPass": 5784.540649090909,
  "maxRss": 193425408,
  "maxRssMiB": 184.46484375,
  "readBytes": 8042191296,
  "tensorsRead": 3459,
  "tensorCacheBytes": 0,
  "tensorCacheEntries": 0,
  "kvRamPages": 22,
  "kvSpilled": 462,
  "diskKvBytes": 949872
}
```

Interpretation:

This proves low RAM is possible in the current runtime, but it is far too slow because it rereads 8.04 GB of tensor data for only 4 generated tokens.

## Run B — existing tensor cache enabled

Options:

```json
{
  "tensorCacheBytes": 1610612736,
  "maxRamKvTokens": 64,
  "spillKvToDisk": true,
  "deleteScratchOnClose": true,
  "maxNewTokens": 4
}
```

Results:

```json
{
  "wallMs": 41348.926082,
  "msPerGeneratedToken": 10337.2315205,
  "msPerTokenPass": 1879.496640090909,
  "maxRss": 469590016,
  "maxRssMiB": 447.8359375,
  "readBytes": 409905600,
  "tensorsRead": 222,
  "tensorCacheBytes": 409890816,
  "tensorCacheEntries": 200,
  "kvRamPages": 484,
  "kvSpilled": 0,
  "diskKvBytes": 0
}
```

Interpretation:

Caching speeds the run up by about 3.08x but raises max RSS by about 263.37 MiB. It is still nowhere near 50ms/token because the runtime still invokes projection/attention/FFN through fragmented JS orchestration.

## Current bottleneck proof

- Low RAM without pack/fusion causes enormous repeated reads.
- Existing cache avoids reads but pays RAM.
- The newly implemented AWTPACK runtime cache must now replace repeated `.awtai-db` tensor reads while staying disk-backed.
- The next real speed leap requires native fused layer execution from pack files, not just pack projection parity.

## 50ms target distance

Cached current run:

```text
1879.50 ms/token-pass
```

Target:

```text
50 ms/token-pass or better
```

Needed speedup from current cached path:

```text
~37.6x
```

Needed speedup from low-RAM no-cache path:

```text
~115.7x
```

## Next implementation gate

Implement pack-backed runtime execution:

1. Open attention/FFN pack per layer.
2. Replace `streamer.raw(tensor)` in hot projection path with pack-backed reads.
3. Then fuse QKV, FFN, and LM-head top-k native execution.

The path is now proven by exact pack projection parity, but chat is not yet using the pack path.
