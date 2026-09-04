# B"H

# Constraints, Provenance, and Cache

> The Awtsmoos renews boundary, artifact, and memory before finite time can divide; Awtsmoos.com records what was solved, deferred, reused, or denied.

## Generic constraint vocabulary

The built-in noun-neutral vocabulary currently names:

`minClearance`, `maxSlope`, `mustTouch`, `mustNotIntersect`, `supportLoad`, `preserveVolume`, `withinRegion`, `preserveSilhouette`, `biologicalProportion`, `structuralLimit`, `performanceLimit`, and `semanticExclusion`.

Vocabulary does not imply a universal solver exists. It gives domains a portable semantic name that specialist solvers can claim.

## Solver capability truth

A solver manifest declares supported constraint types and semantic kinds, support state, execution tier, determinism, adapters, input/output schemas, examples, diagnostics, and metadata. Solver functions remain private.

Planning outcomes are explicit:

- known constraint with no solver → `deferred`;
- unknown constraint → `unsupported`;
- manifest says native/adapter but no private executor exists → downgraded to `deferred` with `CONSTRAINT_EXECUTOR_UNAVAILABLE`;
- registered native/adapter solver → executable.

Default compile mode records unresolved constraints but may continue. `{strictConstraints:true}` rejects unresolved or unsatisfied work before compiler execution.

## Registration example

```js
const awtsmoos=createAwtsmoos({
	constraintSolvers:[{
		capability:{
			id:'clearance',
			constraintTypes:['minClearance'],
			kinds:['architecture.*'],
			supportState:'native',
			determinism:'deterministic'
		},
		solver:({constraint})=>({satisfied:constraint.value>=2})
	}]
});
```

Solvers return receipts and do not mutate canonical definitions.

## Compilation cache

The facade reuses the existing bounded `ProceduralCompilationCache`; it does not create a second cache subsystem. Cache identity incorporates semantic definition data, artifact request, compiler chain, constraint plan/resolution, and selected compiler versions/support states.

Deterministic and seeded compiler paths may reuse cached compile output. Environment-dependent compiler or solver paths bypass cache. Semantic or artifact-request changes produce a new key.

The expert cache namespace intentionally exposes only:

```js
awtsmoos.cache.stats();
awtsmoos.cache.clear();
```

Cached artifact values are not exposed for arbitrary mutation or insertion.

## Provenance

Compile receipts identify semantic content hash/seed, requested channels and quality, compiler ids/versions/support/execution tiers/adapters/dependencies, constraint resolution, execution coverage, and cache evidence. This data is suitable for reproducibility diagnostics and downstream AI retrieval.
