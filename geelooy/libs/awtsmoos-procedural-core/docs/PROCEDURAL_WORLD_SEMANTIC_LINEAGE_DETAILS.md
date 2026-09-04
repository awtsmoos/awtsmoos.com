# B"H — World Semantic Lineage Details

Boruch Hashem. Blessed is He.

The Awtsmoos renews every dependency before an artifact can claim yesterday's cause is gone;
Awtsmoos.com preserves lineage through change so selective rebuilding can know what truth it depends upon.

## Why semantic relationships are not dependencies

A generic relationship is descriptive truth, not automatically causal truth. Treating every `near`, `inside`, `wears`, or `growingOn` edge as invalidation would over-rebuild worlds and hardcode domain ontology into the generic kernel.

`WorldDependencyPolicyRegistry` therefore carries explicit regeneration policy outside canonical relationship meaning. A later authored-policy adapter may place that evidence nearer source data without changing this kernel contract.

## Why identity is split

Definition identity is already authoritative through `createDefinitionIdentityReceipt`.

World `semanticHash` composes those Definition identities with semantic topology. It deliberately ignores dependency policy.

`dependencyHash` composes the policy snapshot with promoted causal edges. It may change while semantic identity remains stable.

Compiler cache keys remain a third authority because runtime artifact identity also depends on compiler/version/request/channel/quality/options.

## Deletion-safe impact

A before snapshot may contain:

`root -> leaf`

If `root` is removed, the after snapshot cannot contain that edge. Traversing only after-state dependencies would incorrectly leave `leaf` untouched.

`createWorldChangeImpactReceipt` therefore creates a union dependency graph from before + after causal edges and asks the existing `findAffectedProceduralNodes` authority for transitive closure.

This also preserves policy-change consequences: changing edge direction or enabling/disabling policy seeds both changed endpoints before closure.

## Ordering and portability

Definition collection order is preserved separately as `definitionOrder` but excluded from semantic/dependency hashes.

Identity receipts and topology edges are canonicalized for deterministic hashing. Public lookups use frozen null-prototype objects so hostile-but-valid ids such as `__proto__` remain safe.

All snapshot/change receipts are JSON-safe and omit timestamps so identical inputs produce identical evidence.

## Unresolved external targets

Semantic topology retains unresolved endpoint evidence and emits `WORLD_SEMANTIC_TARGET_UNRESOLVED`.

If a dependency policy would otherwise promote that relationship, dependency topology emits `WORLD_DEPENDENCY_TARGET_UNRESOLVED` instead of manufacturing a local dependency.

A cross-document resolver can later bind such targets explicitly.

## Next composition layer

World lineage currently answers: **which Definitions require reconsideration?**

The next layer should answer: **which concrete artifact channels require regeneration?**

That future composition should reuse:

- world `affectedIds`;
- Definition patch receipts and `affectedArtifacts`;
- compiler capability/artifact-channel evidence;
- compiler/version-aware compile cache keys;
- artifact provenance/lineage receipts.

It should not create another semantic hash, dependency graph, or cache.
