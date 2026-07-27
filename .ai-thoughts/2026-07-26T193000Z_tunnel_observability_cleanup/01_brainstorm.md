B"H
Boruch Hashem
Blessed is He

# Brainstorm

## Remaining Observed Defects

- Dead historical tunnel records remain in device discovery and produce repeated stale warnings.
- A healthy request that exceeds the relay's short synchronous window returns a pending envelope that some clients may mistake for failure.
- Tunnel doctor mixes cumulative historical worker failures and cancellations with present transport health.
- Health output needs separate current, historical, and informational sections.
- Route discovery should show one authoritative device plus optional compact history, not several equivalent dead shadows.

## Permanent Invariants

1. Exactly one authoritative route is recommended for one account/device/alias.
2. Dead superseded records are excluded from default device listings after bounded retention.
3. Historical records remain auditable through a dedicated history field or action.
4. Pending means accepted and durable, never failed.
5. Every pending response contains the exact continuation action, job ID, request identity, and retry safety.
6. Doctor status separates current failures from lifetime counters.
7. A healthy current route cannot be marked degraded solely because old tests failed.
8. Tests cover stale shadow collapse, pending semantics, and health-history separation.
