B"H
Boruch Hashem
Blessed is He

# Final Execution Plan

## Inspection

- Read relay aliases, canonical request/envelope, request plan, dispatch, response identity, retries, and lifecycle.
- Read API tunnel payload normalization and response pruning.
- Read agent action registry, root resolution, batching, command worker, receipt store, and replay logic.
- Trace installer packaging to ensure every modified runtime file enters the verified release ZIP.

## Implementation

- Add a compact immutable request-scope module where needed.
- Rewrite complete files only.
- Keep every touched source file below 120 lines and tab-indented.
- Separate request action and execution action throughout receipts and envelopes.
- Normalize absolute root/cwd at ingress and preserve it across batch/retry.
- Make continuation responses self-contained and non-replaying.
- Deduplicate stale route descriptors without deleting durable identity.

## Verification

- Unit tests for action promotion identity.
- Unit tests for root/cwd preservation.
- Batch inheritance and explicit override tests.
- Retry/replay scope preservation tests.
- Timeout continuation and output paging tests.
- Cancellation non-replay tests.
- Route deduplication tests.
- Existing relay correlation, concurrency, timeout, and retry suites.
- Agent command, filesystem, batch, root, and job-store suites.
- Rebuild and verify runtime manifest and release bundle closure.
- Run isolated `curl | bash` install twice from ordinary directories and prove startup, reconnect, standard actions, identity, and root.
