# B"H

# Three-Pass Plan

## Pass 1 — native ownership seed

Create the smallest native model owner that maps an `.awtai-db` file exactly once, verifies `AWTDB001`, reads manifest length, computes payload offset, and returns a tiny handle to JavaScript. This does not run inference. It is the vessel for the later decode engine.

Files to write completely:

- `native/awtai_model_map.h`
- `native/awtai_model_map.c`
- `native/addon.c`
- `native/build.sh`
- `native/native-matvec.js`

## Pass 2 — exported API and safety

The N-API surface should use an external handle with a finalizer so JS garbage collection cannot leak the mmap forever. Explicit close should also exist. The status object should report `modelMap: true` when the addon supports it.

Safety checks:

- path must be a string
- file must open
- file size must be at least 16 bytes
- magic must match
- manifest must fit inside file
- close must tolerate null already closed handles

## Pass 3 — verification and handoff

Build the native addon with the updated source list. Then load `native/native-matvec.js` and inspect `nativeStatus()`. If there is no model file available, verify compile/load only and record that model-open runtime verification is pending. If a model path exists, run `nativeOpenModelMap(path)` and close the handle.

## Future work deliberately not done in this slice

- no q/k/v fused native layer yet
- no native KV implementation yet
- no replacement of `runToken`
- no change to default projection path
- no default use of `projectFileRows`

The Awtsmoos in the code is hidden like fire behind the letters: this pass builds the chamber, not yet the thunderbolt.
