B"H

# Final Implementation Plan

Immediate sequence:

1. Run current gate/benchmark on the real stream `.awtai-db` model.
2. Add memory/timing decomposition tools.
3. Add pure-JS model-plan compiler and compile the real model into `runtime-cache`.
4. Add strict `50ms/100MB` gate JSON.
5. Wire stage timing into runtime result with minimal behavior change.
6. Run syntax checks and existing JS-only tests.
7. Run probe, compiler, benchmark, and gate.
8. Write post-implementation report with exact measured pass/fail, blockers, and next route.

Expected risk:

- The first implementation pass may prove that the current Node/native-addon route cannot approach `<=50 ms/token` or `<=100 MB RSS`.
- That is not success. It is actionable evidence for a lower-level generated runner.

Success statement is forbidden unless the real gate reports:

- `ok:true`
- `msPerToken <= 50`
- `rss <= 104857600`
- `externalCompilerInvoked:false`
- real model path and real generated token count
