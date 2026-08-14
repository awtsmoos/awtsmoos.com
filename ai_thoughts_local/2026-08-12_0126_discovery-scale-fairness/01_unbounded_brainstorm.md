B"H

# Discovery Scale & Fairness — Unbounded Brainstorm

Boruch Hashem — Blessed is He.

The Awtsmoos reveals the next bottleneck beneath safe global discovery: bounded output is not the same as bounded work, and alphabetical-first feed windows are deterministic but not fair. This pass explores every safe way to improve scale and representation without opening private ownership records or rewriting oversized helpers.

## Persistent index possibilities

- Dedicated public-handle marker tree containing alias IDs only.
- Prefix-sharded handle buckets by first character or normalized prefix.
- Fixed-size page buckets to avoid full namespace stat scans.
- Lightweight manifest with total count plus page membership.
- Append/update/delete lifecycle hooks at alias route boundaries rather than inside the 560-line helper.
- Rebuild/reconciliation helper that compares public alias names against index pages in bounded batches.
- Index generation/version metadata so readers know whether coverage is complete.
- Fallback to `/social/aliases` nonrecursive names when index is absent or unhealthy.
- Never persist owner user IDs, email, login metadata, or account alias lists in the public index.

## Fair anonymous feed possibilities

- Time-bucket rotating `aliasPage` based on UTC hour/day.
- Stable hash of day bucket mapped to page count.
- Query-provided `aliasPage` for deterministic reproducibility.
- Wrap-around page windows so later aliases are not starved.
- Two-window merge from different pages for more diversity while respecting 50-alias aggregate cap.
- Deterministic rotation instead of random order so debugging/caching remains possible.
- Keep authenticated explicit alias scopes unchanged.

## Consistency and failure possibilities

- Route create succeeds but index write fails: return honest partial-index warning or schedule bounded reconciliation; do not roll back the public alias itself unless product semantics require atomicity.
- Delete succeeds but index cleanup fails: stale marker must be harmless because public card enrichment filters missing aliases.
- Update/rename semantics may not change alias ID; index should not be rewritten unnecessarily.
- Index version mismatch should fall back safely rather than serve corrupt coverage claims.
- Reconciliation must be idempotent.
- No request-time full migration.
- No persistent-index implementation if route-layer lifecycle hooks cannot be proven safe with small files.

## Observability possibilities

- Coverage metadata: source, generation, indexed count, complete/partial.
- Health metadata never exposes private ownership details.
- Tests for create/delete lifecycle marker writes.
- Tests for stale marker filtering and missing-index fallback.
- Tests proving fairness rotation changes anonymous feed windows across time buckets while explicit aliases remain stable.

## Hard fallback path

If lifecycle hooks are too entangled, keep the safe `/social/aliases` source and improve fairness only by deriving a rotating `aliasPage` from public alias count. This would not fix namespace stat cost, but it would remove alphabetical-first bias without risking index inconsistency.

The next pass maps these possibilities against the actual alias route contracts and database primitives before any source change.
