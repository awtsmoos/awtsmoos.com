B"H
Boruch Hashem
Blessed is He

# Observed Failure Graph

The Awtsmoos gives each request one identity and one rooted vessel. The repair must prevent transport layers from silently changing either.

## Reproduced and Observed Failures

1. A `commandRun` request can be promoted to an asynchronous `commandStart` worker.
2. The outer envelope may report `actualAction: commandRun` while the durable receipt reports `actualAction: commandStart`.
3. Shell execution can expose the configured repository as envelope `cwd` even when the command explicitly changes directory internally.
4. Root selection is session-like and can reset or fail to propagate to child actions.
5. Batch child actions can execute against the default configured root instead of the selected/requested root.
6. Retry or replay can lose command context, especially `cwd` or explicit detached-worktree selection.
7. Transport timeout can occur while the durable worker remains healthy.
8. Combined jobs are vulnerable to one cancellation or replay contaminating the evidence chain.
9. Completed jobs may require explicit output paging even when the wait response says completion.
10. Duplicate stale device registrations can appear beside the live route.

## Required Invariants

- Canonical request action never changes after ingress.
- Execution action is separately named when promotion occurs.
- `actionMismatch` derives from canonical request action versus execution action once, not from response-layer rewriting.
- Absolute root and cwd are captured in the canonical request before dispatch.
- Batch children inherit an immutable parent scope unless explicitly overridden.
- Retry/replay reuses the original canonical payload and scope by receipt identity.
- Output/status/cancel actions cannot mutate the target job's request identity.
- Timeouts return a continuation receipt, never an ambiguous failure or implicit replay.
- Device routing deduplicates stale registrations by authoritative live binding.
