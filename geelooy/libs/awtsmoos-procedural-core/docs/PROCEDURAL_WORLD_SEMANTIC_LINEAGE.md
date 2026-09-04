# B"H — Procedural World Semantic Lineage

Boruch Hashem. Blessed is He.

The Awtsmoos renews each meaning before a relation can appear as cause, neighbor, bond, or chain;
Awtsmoos.com keeps semantic truth apart from regeneration law so change can rebuild only what evidence names again.

## Purpose

World semantic lineage composes existing procedural-language authorities into deterministic world-scale change evidence.

It does **not** replace canonical procedural Definitions, Definition identity receipts, action-level dependency graphs, compile cache keys, ProceduralObject graphs, or Portal planning. It adds the missing cross-Definition layer: semantic topology, explicit dependency policy, and before/after transitive impact.

## Two topologies

### Semantic topology

Every canonical cross-Definition relationship is semantic adjacency: **what is related to what?**

`near`, `inside`, `wears`, `growingOn`, and future domain relationships remain semantic-only unless explicit policy says otherwise.

### Dependency topology

Only relationships promoted through `WorldDependencyPolicyRegistry` become regeneration dependencies: **which changed Definition can invalidate which dependent Definition?**

Dependency edges always use:

`upstream -> dependent`

This matches the existing affected-node closure authority.

## Dependency directions

The registry supports:

- `none`
- `source-depends-on-target`
- `target-depends-on-source`
- `bidirectional`

No relationship kinds are registered by default. Domains/plugins must declare causality explicitly.

## Snapshot contract

`createWorldSemanticSnapshot(definitions, { policyRegistry })` returns frozen JSON-safe evidence containing:

- canonical Definition identity receipts;
- authored `definitionOrder`;
- prototype-safe `identitiesById`;
- semantic edges and semantic-topology hash;
- `semanticHash` over Definition identities + semantic edges;
- captured policies and `policyHash`;
- promoted dependency edges and `dependents`;
- `dependencyHash`;
- unresolved-target diagnostics.

Definition collection order does not alter semantic or dependency hashes. Authored order remains available for stable presentation and impact ordering.

## Identity boundaries

`semanticHash` describes world semantic content and excludes dependency policy.

`dependencyHash` describes explicit regeneration policy plus promoted causal topology.

Compile-cache identity stays separate again: compiler id/version, requests, channels, quality, and compile options remain owned by existing compiler/cache authorities.

A policy-only change can therefore alter `dependencyHash` without falsifying Definition identity or semantic content.

## Change-impact receipt

`createWorldChangeImpactReceipt(before, after)` records:

- added, removed, and content-changed Definition ids;
- endpoints touched by dependency-edge changes;
- directly changed and transitively affected ids;
- before/after semantic and dependency hashes;
- independent `semanticChanged` and `dependencyChanged` flags.

Deletion is the difficult case. If `leaf` depends on `root` and `root` disappears, the new graph no longer contains the old edge. The receipt therefore traverses the union of **before + after** dependency edges, preserving enough old causality to invalidate surviving dependents correctly.

## External targets and cycles

Unresolved/external relationships remain semantic evidence and emit diagnostics. Dependency promotion never fabricates a local node from an unresolved target.

Dependency cycles are legal for impact analysis. Existing visited-set closure terminates safely. Execution planners may impose stricter ordering rules later without erasing dependency truth here.

## Verification

Adversarial tests prove all four policy directions, semantic-only edges, duplicate/prototype-hostile ids, unresolved targets, reorder-stable hashes, content propagation, deletion through old edges, addition through new edges, policy-only invalidation, cycle closure, JSON portability, and freezing.

All **19** `proceduralLanguage*.test.mjs` files pass with this layer present.

## Deeper reference

See `PROCEDURAL_WORLD_SEMANTIC_LINEAGE_DETAILS.md` for rationale, identity boundaries, deletion mechanics, and future artifact-channel composition.
