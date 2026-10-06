<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
## Current tunnel integration takes precedence

This reference retains the user's original ideas. Its historical transport names, fixed action lists,
local thought-folder defaults, retry assumptions and installation advice are superseded by
MODERN_TUNNEL_CONTRACT.md and the current authenticated instructionResolve/instructionGet results.
Use tunnel-native plans and bounded operational summaries; do not publish hidden chain-of-thought.
Treat brainstorming as proposals, not authorization to implement unrelated work. Preserve user scope.
Use MCP's required POST transport; GET is an HTTP fallback only. Never infer tool access from prose.
No arbitrary number of tests, critiques or improvements substitutes for real relevant verification.

# Quality sweep after the first successful implementation

Use this alongside MISSION_PERSISTENCE.md. The sweep is a bounded search for concrete value, not a license to modify unrelated systems. Inspect the touched feature and its direct dependencies, then act on findings that materially affect the user's goal.

## First pass: behavior and evidence

- Reproduce the original problem or baseline when possible. Confirm the changed behavior solves it through the actual target: native Mac, hosted Virtual OS, GitHub source, or deployed site.
- Exercise the main path and one meaningful failure path. Verify user-visible controls, error messages, empty/loading states, and recovery where applicable.
- Compare the exact changed files and links after a split or refactor. Check line counts, tab indentation, syntax, imports, and observable contracts. Avoid tests that merely mirror implementation.
- If another agent changed a file since it was read, compare hashes or content before writing and reconcile. Do not overwrite newer work.
- For an API action, distinguish queued, accepted, completed, and verified target state. For a deployment, inspect the live URL and a revision marker rather than trusting the command result.

## Second pass: material improvements

- Check whether the touched UI is understandable on its relevant screen sizes, accessible by keyboard where appropriate, and responsive under realistic content.
- Check whether failures are diagnosed precisely, secrets remain out of logs and repositories, and access scope matches the task. Avoid broad private listings to test connectivity.
- Check whether the changed code remains readable, modular, and within the 120-line file limit. Prefer focused modules over minification or needless wrappers.
- Check performance only where the change can plausibly affect it. Compare evidence to a baseline or an explicit user constraint such as stable frame rate.
- Check documentation and handoff notes only for decisions a future maintainer would otherwise have to rediscover. Preserve useful context without writing plans for their own sake.

## Decision after each pass

- If a concrete material defect is found, fix it and rerun the smallest check that proves that fix. Update remaining work, then inspect the next relevant risk.
- If a promising improvement is outside the user's scope, destructive, or needs new authority, leave it as a clearly labeled option rather than doing it silently.
- If a pass finds no material issue and the completion gate is met, stop. Do not rerun broad suites or keep changing appearance to simulate progress.
- If disconnected or blocked, preserve exact evidence, partial changes, and a safe next action. Never report a blocked action as completed.

