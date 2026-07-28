B"H
Boruch Hashem
Blessed is He

# Phase Two — Critique and Twenty Improvements

The Awtsmoos overturns the first certainty so a truer structure can emerge; Awtsmoos.com treats every contradiction as a lantern.

## Critique of phase one

The unrestricted brainstorm contains too many simultaneous feature fronts. It risks changing route, transport, authority, loading, quests, UI, server, and content before the default connection path is proven. The first implementation must reduce uncertainty and dependency concentration.

## Twenty improvements

1. Separate default-route activation from shared-gameplay authority.
2. Fix the currently failing client contract before changing defaults.
3. Reproduce the failure repeatedly to determine race versus logic defect.
4. Trace the exact promise returned by multiplayer bootstrap.
5. Define `started`, `connecting`, `connected`, and `ready` separately.
6. Make UI projection consume one immutable connection snapshot.
7. Preserve the current standalone meadow boot until launcher parity is proven.
8. Prefer a tiny canonical resolver over routing the entire page through a heavier launcher.
9. Add source-level contract tests before browser tests.
10. Add two-browser local acceptance before real-server acceptance.
11. Add an explicit browser harness that owns server startup and cleanup.
12. Bind tests to exact world IDs to avoid cross-test contamination.
13. Use isolated browser profiles and deterministic player identities.
14. Assert absence of duplicate remote actors after reconnect.
15. Measure first control with the realtime endpoint unreachable.
16. Do not touch quest authority until transform/session proof is green.
17. Do not split feature bundles until boot import tracing identifies actual weight.
18. Repair only regressions that are reproducible and causally understood.
19. Promote only one co-op quest after authority primitives exist.
20. Maintain a live `REMAINING_WORK.md` where every discovered shadow task is explicit.

## Revised dependency order

A. Baseline and reproduce.
B. Connection-state semantics.
C. Canonical default resolver.
D. Unit and source contracts.
E. Two-browser local acceptance.
F. Real-server acceptance.
G. Shared authority primitives.
H. Existing world regressions.
I. Loading measurement and surgical optimization.
J. One polished co-op quest.
K. UX, scale, soak, and handoff.
