# B"H

# Native Attention + Raw Repo Compiler Plan

## User requirement

No CMake. No external library vendoring. Every include/source must be raw repo files or system headers/frameworks already used by the direct native build. The AWTAI native addon must continue compiling on the spot from `.c` files in the repo.

## Build-system plan

Improve the existing repo-local compiler area at:

`geelooy/scripts/awtsmoos/compiling`

by adding a raw C addon builder module. This is not CMake and not a package manager. It is a small repo-owned Node script that:

- receives a manifest of `.c` files
- rejects non-`.c` sources
- rejects sources outside the native directory
- resolves Node headers from the current `node` executable
- invokes the host C compiler directly
- emits the `.node` addon

AWTAI `native/build.sh` will call that repo-local builder instead of embedding a large clang command.

## Native attention plan

Add a native attention session as the next safe step after mapped qkv and mapped FFN.

Files:

- `native/awtai_native_attention.h`
- `native/awtai_native_attention.c`
- `native/addon.c`
- `native/native-matvec.js`
- `native/build-manifest.json`
- `native/build.sh`
- `execution/attention-step.js`
- `decode/chat-loop.js`

Native session behavior:

- JavaScript creates one attention session per chat context.
- Native session owns per-layer K/V arrays.
- Native call receives q/k/v projections for one layer and token position.
- Native applies RoPE to q and k.
- Native appends rotated k and v.
- Native computes attention output and returns a `Float32Array(hidden)`.
- On failure or disabled env var, JS falls back to the existing RoPE + KV + JS attention path.

Environment gates:

- `AWTAI_NATIVE_ATTENTION=0` disables native attention.
- `AWTAI_NATIVE_ATTENTION_TOKENS=N` caps native KV capacity.

## Safety

This first native attention session is RAM-resident. It removes JS object overhead and boundary churn, but it is not the final disk-spilled native KV implementation. Therefore it has a capacity cap and fallback to existing disk-backed JS KV for correctness.

## Verification

- Build with the repo-local raw C addon builder.
- Load addon and check `nativeAttention: true`.
- Synthetic parity: native attention output equals JS RoPE + JS KV + JS attention for a short sequence.
- JS syntax checks.

The Awtsmoos in the code takes the q/k/v sparks and folds them into one native chamber: not yet the final palace, but the hallway of JS begins to vanish.
