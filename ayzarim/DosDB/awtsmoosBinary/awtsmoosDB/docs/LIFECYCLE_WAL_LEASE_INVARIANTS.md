<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Lifecycle, WAL, and Lease Invariants

WAL recovery, allocation leases, retirement quarantine, and read-only protections form one safety boundary. Storage reclamation must not weaken any part.

## Writable lifecycle

- Acquire the writable process/database lock.
- Recover or validate WAL before ordinary mutation.
- Lease selected free ranges before writing.
- Retire replaced ranges; do not immediately reuse same-generation bytes.
- Persist metadata and free-list state coherently.
- Await idle before close, copy, hash, or publish.

## Read-only lifecycle

Read-only opens disable WAL creation and mutation, use shared locks, avoid free-list hydration for search-only sessions, and reject writes. A read-only audit must not change file size, modification time, or sidecars.

## Quarantine rule

A retired range becomes reusable only after the verifier proves it is outside reachable state and no active lease owns it. Apparent deleted space may therefore be intentional quarantine, not a leak.

## Source anchors

- `core/wal.js`
- `core/allocator/allocationLeases.js`
- `core/allocator/retirementQueue.js`
- `core/allocator/verifiedReuseGate.js`
- `core/pager/readOnlyPager.js`
