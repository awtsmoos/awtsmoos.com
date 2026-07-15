<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# V2 Allocator Reuse and Tail Reclaim

The public facade applies `reuseFreedSpace: "verified"` when callers omit the option. Explicit false, legacy true, verified, and read-only choices remain authoritative.

## Verified reuse

The verifier computes the complement of reachable ranges, validates and coalesces free ranges, excludes active leases and quarantined retirement, then selects a fitting range. Omitted and explicit verified modes must produce identical disposable-test checkpoints.

## Tail reclaim

A free range touching the physical cursor may permit truncation only after all reachable, leased, quarantined, WAL, and metadata obligations are excluded. Never truncate a live production file merely to save space.

## Growth interpretation

Measure logical cursor, physical bytes, allocated blocks, WAL bytes, free bytes, range count, and largest gap. Oscillation across replacement rounds is not necessarily a leak; stable idle cycles must show zero growth, and fragmented churn must remain bounded.

## Safe vacuum

When historical fragmentation dominates, create an isolated candidate, verify semantic digest and every index invariant, rehearse restart, preserve rollback, and request cutover approval.
