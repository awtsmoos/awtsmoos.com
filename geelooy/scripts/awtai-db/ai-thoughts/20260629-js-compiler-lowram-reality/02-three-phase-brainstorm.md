B"H

# Three-Phase Brainstorm

## Pass 1: Every possible speed vessel
- Never use gcc/clang/MSVC/CMake/node-gyp/npm. Only Node built-ins and repo JavaScript.
- Generate model-aware JS files from validated metadata.
- Specialize LM-head Q6_K scanner: no type switch per row, no subarray per row, one reusable window buffer.
- Let generated scanner live under runtime-cache/js-kernels with versioned hash keys.
- Keep direct generic scanner as fallback.
- Add precompile CLI for generated kernels.
- Add benchmark CLI that can compare current default, direct JS, compiled JS, and no-native paths.
- Reduce default tensor cache to 0 so low RAM is default instead of an env accident.
- Report temp bytes before scratch deletion.
- Improve prompt renderer to support message arrays and metadata-informed role formatting.
- Gate quality tweaks rather than fake coherence.

## Pass 2: Theoretical files to touch
Existing full rewrites:
- lm-head/direct-quant-topk.js: route to compiled top-k first, fallback to generic.
- decode/chat-loop.js: low-RAM default cache, temp bytes, prompt messages, options plumbing.
- decode/prompt-template.js: message-array/system/assistant rendering.
- bin/real-chat.js: expose env options for compiled kernels, scratch cleanup, sampling gates.

New small modules:
- compile/cache-dir.js
- compile/cache-key.js
- compile/lm-head-plan.js
- compile/lm-head-source.js
- compile/lm-head-compiler.js
- lm-head/compiled-topk.js
- scratch/dir-size.js
- bin/compile-js-kernels.js
- bin/bench-chat.js
- tests/test-prompt-template.js
- tests/test-compiled-lm-head.js
- tests/test-no-native-status.js

## Pass 3: Improved final plan
Actually implement the smallest verified slice that can run now:
1. Add JS compilation system for LM-head Q6_K only, because the real model's LM-head is Q6_K.
2. Validate tensor dims/type/byteLength/offset before emitting.
3. Generate a deterministic scanner with hash/version; no eval; normal require of generated file.
4. Integrate only when AWTAI_COMPILED_LM_HEAD is not explicitly off.
5. Keep fallback generic path and export fallback for parity tests.
6. Change low-RAM default cache to 0.
7. Add prompt renderer snapshots and model-dependent compiled parity test.
8. Add benchmark command with child-process isolation.
9. Run syntax/tests and then real benchmark.

Thirty improvements remembered:
- Prefer cached generated source over runtime Function/eval.
- Include tensor offset and byte length in hash.
- Include .awtai-db file size in hash.
- Version compiler keys.
- Use temp file + rename for cache writes.
- Delete require cache when rebuilding.
- Add AWTAI_REBUILD_JS_KERNELS.
- Add AWTAI_COMPILED_TOPK_ROWS.
- Add maxRows option only for tests.
- Do not make generated files huge.
- Do not modify native files.
- Do not call native compiler.
- Keep direct fallback export.
- Keep all new files under 120 lines.
- Avoid full logits array in compiled path.
- Record read/dequant bytes for compiled path.
- Record cache file/key in stats events.
- Support precompile CLI.
- Support benchmark modes via env/args.
- Preserve .awtai-db compatibility.
- Improve messages rendering without universal Jinja overclaim.
- Report temp bytes.
- Make scratch deletion optional.
- Add no-native status test.
- Add prompt snapshot test.
- Add compiled source validity test.
- Add model parity test if model supplied.
- Be honest if benchmark is worse.
- Cite command evidence in final.
- Continue from real file reads, not memory.
