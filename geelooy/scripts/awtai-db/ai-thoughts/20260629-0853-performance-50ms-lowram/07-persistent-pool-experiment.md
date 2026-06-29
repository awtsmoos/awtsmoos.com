# B"H

# Persistent Pool Experiment

## Goal

Attack per-projection `pthread_create` / `pthread_join` overhead.

## Files changed

- `native/awtai_project_threaded.h`
- `native/awtai_project_threaded.c`
- `native/awtai_fused_ffn.c`

## First implementation

The first implementation made the persistent pool default. It rebuilt successfully, but the first one-token-pass result was bad:

```json
{
  "text": "кет",
  "wallMs": 8000.406865,
  "maxRssMiB": 348.16796875,
  "readBytes": 409891488,
  "tensorsRead": 201,
  "layers": 22
}
```

Then a same-process cold/warm benchmark showed the pool can help once warmed:

```json
{"label":"cold","text":"кет","wallMs":4013.779324,"maxRssMiB":268.68359375,"readBytes":409891488,"tensorsRead":201,"layers":22}
{"label":"warm","text":"кет","wallMs":3263.666507,"maxRssMiB":436.58203125,"readBytes":409891488,"tensorsRead":201,"layers":22}
```

The warm 3263.666507 ms was better than the previous fused-FFN one-token result of 3746.505702 ms, but the default cold behavior was too risky.

## Real prompt with pool default

Prompt:

```text
Write one sentence.
```

Output:

```text
\nThe sun is
```

Result with pool default:

```json
{
  "promptTokens": 19,
  "generatedTokens": 4,
  "tokenPasses": 22,
  "wallMs": 58979.436377,
  "msPerTokenPass": 2680.8834716818183,
  "maxRssMiB": 438.37890625,
  "readBytes": 409905600,
  "tensorsRead": 222,
  "layers": 484
}
```

This was slower than the earlier fused-FFN real prompt result, so leaving the pool on by default would be a regression.

## Final state of this pass

The persistent pool is now opt-in:

```bash
AWTAI_PERSISTENT_POOL=1
```

Default behavior returns to legacy temporary projection threading, while preserving the pool experiment for future session/warm runs.

After rebuild, default one-token sanity result:

```json
{
  "text": "кет",
  "wallMs": 3431.482866,
  "maxRssMiB": 333.34375,
  "readBytes": 409891488,
  "tensorsRead": 201,
  "layers": 22
}
```

## Decision

The pool can help warm sessions, but it is not the main road to 50ms. The next faster/better step is not more pthread orchestration. It is one of:

1. SIMD dot kernels for Q2_K/Q4_K/Q6_K.
2. Accelerate/Metal-backed projections.
3. Native fused attention/layer using one call and one worker strategy.
4. Native LM-head top-k without shipping full logits to JS.
5. Session runtime so the model and hot cache remain alive across turns.

## Honest distance

Best current one-token sanity after this pass:

```text
3431.48 ms/token-pass
```

Target:

```text
50 ms/token-pass
```

Remaining gap:

```text
~68.6x
```

This means algorithmic/vector backend work is required. Scalar custom kernels plus JS orchestration will not honestly reach the gate.
