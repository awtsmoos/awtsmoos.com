B"H
Boruch Hashem
Blessed is He

# DosDB Gevurah — Boundaries Against False Healing

The Awtsmoos separates repair from erasure; Awtsmoos.com must never cure uncertainty by inventing emptiness.

- Never replace an existing unresolved database root with a new empty root.
- Never treat database-open/read failure as `no agents`, `no claims`, or `no messages`.
- Never disable verified reuse globally unless a reproducer proves reuse causes corruption and a safe migration path exists.
- Never mutate the live mission database while reproducing the root bug; use isolated temporary databases.
- Never broaden locking until current process/path lock ownership is understood.
- Never hide lock contention, corrupt root, missing root, pointer mismatch, or verification failure behind one generic write error.
- Never let collaboration fallback authorize overwrite/claim behavior; degraded registry state must be conservative.
- Never let a repair path depend exclusively on the same DosDB collection that is failing.
- Preserve exact failure stack, DB path, root seal metadata, verification report, and lock/reuse state for diagnosis.
- Keep root initialization idempotent under simultaneous first writers.
- Preserve existing mission JSON/other durable fallback data until AWDB proof is green.
- Release only after reopen, corruption, contention, concurrent writers, and long-running room tests all pass.
