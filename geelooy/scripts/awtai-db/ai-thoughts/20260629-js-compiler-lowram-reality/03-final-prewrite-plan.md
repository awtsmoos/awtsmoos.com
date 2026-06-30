B"H

# Final Prewrite Plan

Files to rewrite fully:
- lm-head/direct-quant-topk.js: compiled-first wrapper and generic fallback export.
- decode/chat-loop.js: low RAM default, temp bytes, generated count in result, delete scratch option remains explicit.
- decode/prompt-template.js: metadata-aware TinyLlama message renderer.
- bin/real-chat.js: more CLI env options without changing positional usage.

Files to add fully:
- compile/cache-dir.js: deterministic runtime-cache/js-kernels dir.
- compile/cache-key.js: crypto hash and compiler version.
- compile/lm-head-plan.js: validate LM-head shape/type/byte length.
- compile/lm-head-source.js: controlled source template for Q6_K scanner.
- compile/lm-head-compiler.js: write generated source safely and require it.
- lm-head/compiled-topk.js: runtime bridge from ctx/tensor/input to generated kernel.
- scratch/dir-size.js: recursive byte counter.
- bin/compile-js-kernels.js: explicit precompile command.
- bin/bench-chat.js: repeatable benchmark harness.
- tests/test-prompt-template.js: snapshots.
- tests/test-no-native-status.js: confirms AWTAI_NO_NATIVE disables addon.
- tests/test-compiled-lm-head.js: generated validity; with model arg, parity on first rows.
- tests/run-js-only-tests.js: test aggregator.

Verification commands:
- node --check on every changed/added JS file.
- node tests/run-js-only-tests.js
- node tests/test-compiled-lm-head.js /Users/.../TinyLlama...awtai-db
- node bin/compile-js-kernels.js /Users/.../TinyLlama...awtai-db
- benchmark direct vs compiled with low-RAM flags.

Completion gate:
A win is only claimed if measured. If wall improves, report exact numbers. If not, report that the architecture was made testable but target remains unmet.
