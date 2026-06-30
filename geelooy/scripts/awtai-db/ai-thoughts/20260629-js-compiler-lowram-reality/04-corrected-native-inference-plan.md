B"H

# Corrected Law From User

The user clarified: native inference is allowed. The forbidden thing is relying on external native toolchains to compile/build. Therefore:

- Existing checked-in `native/awtai_native.node` may be used for inference.
- Existing C files may be analyzed and improved, but rebuilding them through clang/gcc/MSVC is forbidden unless replaced by a pure JS native-code emitter.
- Current `rawCAddonBuilder.mjs` is not a pure compiler. It validates manifest in JS but invokes `clang` or `cl`. This must be marked as forbidden-by-default so no future pass mistakes it for compliant compilation.
- The 50ms/token and <=50MB RAM target must be a benchmark gate. Passing is not claimed unless measured.

Real state before this correction:
- Full chat direct: 44.503s for 2 tokens, ~440.9MB RSS.
- Full chat compiled JS LM-head: 48.004s for 2 tokens, ~442.2MB RSS.
- Both produce text newline + S.
- The compiled JS LM-head path reduced tensor read events but not wall time.

Next engineering targets:
1. Add hard gate benchmark command that fails on >50ms/token or >50MB RSS.
2. Add native-fast preset that enables existing native mapped model, persistent native pool, low tensor cache, no generated JS LM-head regression.
3. Audit current native path for mmap RSS illusion: model mapping and Node/V8 RSS alone already exceed 50MB, so the gate should reveal that impossibility honestly.
4. Make build script refuse system compiler unless AWTS_ALLOW_EXTERNAL_CC=1, documenting that pure JS native-code emission is still not implemented.
5. Run fastest native preset benchmarks.
