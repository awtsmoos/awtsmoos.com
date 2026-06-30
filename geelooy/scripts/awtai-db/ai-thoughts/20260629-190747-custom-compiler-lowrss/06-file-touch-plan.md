B"H

# File-Touch Plan

First pass source files to add or rewrite:

- `profiling/stage-timer.js`: tiny stage timer utility.
- `bin/probe-memory-timing.js`: micro-probe runner for startup, open, tokenizer, streamer, first tensor/projection, one token.
- `compile/model-plan-compiler.js`: pure JS compiler from manifest to deterministic execution plan artifact.
- `bin/compile-model-plan.js`: CLI for compiler artifacts.
- `bin/gate-50ms-100mb.js`: strict mission gate with requested JSON fields.

Likely small rewrites after first measurement:

- `decode/chat-loop.js`: accept/use compiled plan and add timing breakdown to result.
- `decode/token-runner.js`: stage-level timing hooks.
- `execution/attention-step.js`, `execution/ffn-step.js`, `execution/lm-head.js`: timing hooks around major work if necessary.

Rules:

- Do not re-enable external compiler usage.
- Keep files short where possible.
- Read back touched files.
- Run syntax checks and JS-only tests.
- Run real benchmark/gate and report failure honestly if the gate is not met.
