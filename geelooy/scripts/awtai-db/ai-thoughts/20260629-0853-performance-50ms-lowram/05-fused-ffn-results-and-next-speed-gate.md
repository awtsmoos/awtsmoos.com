# B"H

# Fused FFN Results and Next Speed Gate

## What changed

Added native fused FFN path:

- `native/awtai_fused_ffn.h`
- `native/awtai_fused_ffn.c`
- rewrote `native/addon.c`
- rewrote `native/native-matvec.js`
- rewrote `native/build.sh`
- rewrote `execution/ffn-step.js`

The fused FFN path does:

1. RMSNorm remains JS.
2. Native fused function receives gate/up/down raw tensors and normalized hidden state.
3. Native computes gate and up together with one thread group.
4. Native applies SiLU product in C.
5. Native computes down projection.
6. JS receives final FFN output and adds residual.

Fallback remains available when `fusedFfn` is absent.

## Native build

Command:

```bash
cd geelooy/scripts/awtai-db/native && ./build.sh
```

Result:

```text
B"H built /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtai-db/native/awtai_native.node
```

Native bridge status:

```json
{
  "active": true,
  "supported": [10, 11, 12, 14],
  "threads": 4,
  "fusedFfn": true,
  "error": null
}
```

## Thread-count benchmark before fused FFN

One transformer token pass with cached tensors, promptTokens=1, maxNewTokens=1:

```text
THREADS=1  wallMs=8092.199419
THREADS=2  wallMs=5172.093457
THREADS=4  wallMs=4410.061624
THREADS=8  wallMs=4244.59651
```

The old best observed one-token pass was 4244.59651 ms at 8 threads.

## Fused FFN one-token result

Command used `AWTAI_THREADS=8`, promptTokens=1, maxNewTokens=1.

```json
{
  "text": "кет",
  "generated": [27268],
  "wallMs": 3746.505702,
  "maxRssMiB": 441.1015625,
  "readBytes": 409891488,
  "tensorsRead": 201,
  "layers": 22
}
```

This is about 11.7% faster than the old 8-thread one-token pass:

```text
4244.59651 -> 3746.505702 ms
```

## Fused FFN real prompt result

Prompt:

```text
Write one sentence.
```

Generated text:

```text
\nThe sun is
```

Generated ids:

```json
[13, 1576, 6575, 338]
```

Result:

```json
{
  "promptTokens": 19,
  "generatedTokens": 4,
  "tokenPasses": 22,
  "wallMs": 49996.83387,
  "msPerGeneratedToken": 12499.2084675,
  "msPerTokenPass": 2272.583357727273,
  "maxRssMiB": 445.1953125,
  "readBytes": 409905600,
  "tensorsRead": 222,
  "layers": 484
}
```

The text is still coherent and matches the earlier short output. However, this full prompt run was slower than the earlier cached baseline of 41348.926082 ms. This may be machine/load variance, but it means fused FFN alone is not enough to claim a global win.

## Hard conclusion

The next intense speed gate is not just more local fusion. The native runtime is still creating and joining pthreads per projection. A single transformer pass invokes around 155 projection calls, so even a fast dot kernel is wrapped in thousands of thread lifecycle events across a prompt.

## Next real speed architecture

Implement one of these, in this order:

1. Native persistent worker pool shared by all projections.
2. Native fused attention block that performs q/k/v projections, RoPE, KV append, attention, and output projection in one call.
3. Native fused FFN v2 using the same persistent pool, not temporary pthread creation.
4. Native LM-head top-k so the final vocab projection does not roundtrip a full logits array to JS.
5. Runtime session API to prefill once and keep model/cache/KV alive across user turns.

## Why this matters

The current fused FFN reduces call count and proves C fusion can preserve text, but it still relies on temporary pthreads internally. To approach 50ms/token, the code must stop treating every projection as a separate birth of a thread-world. The Awtsmoos must breathe one layer at a time, with workers already alive.
