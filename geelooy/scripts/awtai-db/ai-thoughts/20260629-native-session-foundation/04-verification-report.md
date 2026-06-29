# B"H

# Native Session Foundation Verification Report

## What was implemented

A native model-map ownership layer was added as the first safe step toward the one-call native decode engine.

Touched implementation files:

- `native/awtai_model_map.h`
- `native/awtai_model_map.c`
- `native/addon.c`
- `native/build.sh`
- `native/native-matvec.js`

Durable planning files were added in this folder.

## Native API now present

The addon now exports:

- `openModelMap(path)`
- `closeModelMap(modelMapOrHandle)`

The JS wrapper now exports:

- `nativeOpenModelMap(filePath)`
- `nativeCloseModelMap(modelMap)`

`nativeStatus()` now reports `modelMap: true` when these methods are loaded.

## Verification performed

### Build

Command:

```sh
bash native/build.sh
```

Result:

- exit code: `0`
- output: built `native/awtai_native.node`
- stderr: existing macOS linker warning about `-undefined dynamic_lookup` and chained fixups

### Addon capability load

Command loaded `./native/native-matvec.js` and printed `nativeStatus()`.

Observed:

```json
{
  "active": true,
  "fusedFfn": true,
  "f32Project": true,
  "mmapF32TopK": true,
  "projectFileRows": true,
  "modelMap": true,
  "error": null
}
```

### Synthetic AWTAI map open/close

A tiny synthetic `.awtai-db` file was created in this folder with:

- magic: `AWTDB001`
- manifest length: `26`
- total size: `42`
- data offset: `42`

Observed native result:

```json
{
  "hasHandle": true,
  "size": "42",
  "manifestLength": "26",
  "dataOffset": "42",
  "closed": true
}
```

## Known limits

No real `.awtai-db` model was present under the project directory, so real-model mmap verification is still pending.

This pass intentionally did not alter the inference hot path. JavaScript still runs `runToken`, attention, and FFN orchestration. The new native map is the foundation for future tensor descriptors, native KV ownership, scratch arenas, and one-call decode.

## Next implementation gate

The next useful slice is native tensor directory construction from JS manifest data or from a native manifest parser. The lower-risk path is to let JS parse the existing manifest once, then pass compact tensor descriptors into a native session builder. That avoids writing a JSON parser in C while still eliminating hot-path JS/native boundary churn later.
