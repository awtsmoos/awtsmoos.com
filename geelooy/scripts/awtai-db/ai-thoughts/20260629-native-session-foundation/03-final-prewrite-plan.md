# B"H

# Final Prewrite Plan

## Actual files to modify

1. `native/awtai_model_map.h`
   - declare `AwtaiModelMap`
   - declare open/close helpers
   - keep the header small and C-only

2. `native/awtai_model_map.c`
   - open + mmap file
   - validate magic
   - read little-endian manifest length
   - compute `data_offset`
   - close/unmap safely

3. `native/addon.c`
   - include model map header
   - add N-API `openModelMap` and `closeModelMap`
   - export those methods in addition to existing methods
   - do not remove existing APIs yet

4. `native/build.sh`
   - add `awtai_model_map.c` to the clang command

5. `native/native-matvec.js`
   - add JS wrapper functions around the new native methods
   - add `modelMap` capability flag to `nativeStatus()`

## Verification plan

- run `native/build.sh`
- run `node -e "const n=require('./native/native-matvec.js'); console.log(n.nativeStatus())"`
- search for local `.awtai-db` files under the project
- if present, call `nativeOpenModelMap` and `nativeCloseModelMap`

## Guardrails

- No hot path behavior changes.
- No default enablement of file-window projection.
- No partial patching: every touched file is fully rewritten.
- Keep new source files short enough to stay reviewable.
