B"H

# Compiler-Only Architecture Plan

No new native artifact may come from clang, gcc, MSVC, CMake, node-gyp, npm, downloads, or external assemblers.

First compiler route will be pure JavaScript using Node built-ins:

- Read `.awtai-db` manifest.
- Emit a deterministic static execution plan artifact under `runtime-cache`.
- Resolve every tensor name to role, layer, offset, type, byte length, rows, cols, and supported native/JS route.
- Emit a compact JSON plan plus optional generated JS loader modules for low-RSS runners.
- Audit and record `externalCompilerInvoked:false`.

The compiler route will not initially claim machine-code generation. It is a real compiler because it transforms model metadata into runtime artifacts consumed by a specialized runner and benchmark gate.

Second route, if stage timings prove dispatch/metadata overhead is material:

- Emit per-layer plan files so runtime avoids TensorIndex lookups, role matching, and repeated shape interpretation.
- Emit a pre-tokenized prompt artifact for benchmark isolation.
- Emit optional top-k metadata for LM-head scanning without full logits.

Machine-code blobs are only acceptable if produced entirely by repo JS and loadable without external linking. This pass will not fake that.
