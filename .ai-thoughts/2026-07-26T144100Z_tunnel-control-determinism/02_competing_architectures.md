B"H
Boruch Hashem
Blessed is He

# Competing Architectures

## A: Patch response fields only

Rejected. It would hide conflicting state while root, replay, and batching remain nondeterministic.

## B: Trust session root selection

Rejected. Session state is mutable, difficult to compose with batching, and unsafe under concurrent requests.

## C: Canonical immutable execution scope

Chosen. Build a request scope at ingress containing request action, execution action, root, cwd, requester, correlation identifiers, and replay identity. Pass it explicitly through planning, dispatch, worker receipts, batch children, retries, and responses.

## D: Disable promotion and all asynchronous jobs

Rejected. Long commands need durable workers; the fix is truthful identity and deterministic continuation.

## E: Make every command synchronous

Rejected. It would recreate event-loop stalls and transport timeouts.

## Design Principles

1. Distinguish `requestAction` from `executionAction`.
2. Keep `actualAction` as a compatibility alias for `executionAction` only.
3. Never recompute action identity in response pruning.
4. Resolve root and cwd exactly once.
5. Store normalized scope inside durable receipts.
6. Make batch inheritance explicit.
7. Make retry receipt-driven, not caller-payload-driven.
8. Return output metadata consistently from status and wait.
9. Preserve safe cancellation without creating replacement work.
10. Deduplicate route records by live authoritative binding.
