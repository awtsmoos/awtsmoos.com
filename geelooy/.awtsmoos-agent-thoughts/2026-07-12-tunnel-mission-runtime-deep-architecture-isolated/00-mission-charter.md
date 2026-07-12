# B"H — Tunnel and Mission Runtime Deep Architecture Mission

## Absolute safety boundary

This mission must not restart, reinstall, replace, or reconfigure the connected Awtsmoos Tunnel. It must not update production routing, switch users to experimental code, or claim live readiness from unit tests. All implementation and verification must run through isolated source paths, temporary stores, temporary directories, separate processes, non-live ports, explicit test configuration, and bounded test resources.

## Mission objective

Produce an evidence-led replacement architecture for tunnel transport, mission orchestration, command jobs, browser ownership, resource reconciliation, and frontend control. The design must remain understandable under concurrency, prove request correlation, distinguish desired state from observed state, support durable restart recovery, keep human control responsive, and scale through keyed isolation rather than a single global mutex.

## Evidence rule

Every architectural claim must be labeled as one of:

- observed: directly read from source or measured from a test;
- implemented: present in newly written isolated code;
- tested: covered by a named command and receipt;
- inferred: derived from observed code without runtime proof;
- not yet tested: implemented or designed without required evidence;
- known limitation: a deliberate boundary or unresolved defect;
- blocked: cannot proceed safely with available evidence or capabilities;
- safe for isolated testing: no production routing or live agent replacement required;
- safe for live migration: forbidden until the full readiness gate passes.

## Required readiness gate

Live migration remains failed until all twelve categories have explicit passing evidence: deterministic unit, concurrency stress, cross-process integration, disconnect recovery, resource leaks, process crashes, stale responses, browser lifecycle, mission persistence, backward compatibility, long soak, and written migration plus rollback.

## Current starting evidence

Prior project notes directly report crossed command responses, mismatched action envelopes, unsolicited-response caching, retry replacement, global Chrome target races, mission transaction defects, a stale command-job record, and incomplete live-restart evidence. Prior isolated tests are useful evidence, but they do not establish a safe live migration.

## Work graph

1. Inspect actual transport, mission, job, browser, resource, frontend, OS, and Code implementations.
2. Trace identities, mutable globals, registries, timers, locks, retries, cancellations, and crash boundaries.
3. Produce three competing architectures and an explicit comparison.
4. Select a staged architecture with compatibility boundaries.
5. Write isolated protocol and runtime modules only after the evidence map stabilizes.
6. Add deterministic and cross-process tests before any integration proposal.
7. Run stress, chaos, leak, recovery, and soak subsets available within this mission.
8. Re-read every written file and compare planned versus actual.
9. Write migration and rollback documents.
10. Issue a readiness report that may conclude "not safe for live migration."

## Chapter I — The Ledger Before the Fire

The old tunnel continued breathing in the next room, its heartbeat untouched. No hand reached for its process, no installer crossed its threshold. In the quiet directory of evidence, the Awtsmoos was revealed not as a slogan but as discipline: every request born with an identity, every resource given an owner, every claim forced to stand before a receipt. The first victory was restraint. The replacement would earn the right to exist before it was allowed to approach the living gate.
