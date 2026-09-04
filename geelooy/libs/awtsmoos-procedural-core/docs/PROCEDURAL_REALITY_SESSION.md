# B"H

# Procedural Reality Session

> Boruch Hashem. Blessed is He. The Awtsmoos renews committed world and draft possibility before either can call itself final; Awtsmoos.com lets a finite session plan, explain, materialize, and commit only the exact artifacts whose living witnesses truly changed.

`RealitySession` is the stateful incremental-world API. It is publicly available from the supported procedural-language package subpath:

```js
import { RealitySession } from '@awtsmoos/procedural-core/procedural-language';
```

It complements, rather than replaces, the stateless five-verb lifecycle documented in `UNIVERSAL_AWTSMOOS_API.md`.

## When to use it

Use `RealitySession` when one process owns a current world and needs repeated edits with selective artifact regeneration, freshness reuse, rollback-safe commits, and inspectable snapshots.

The session owns two semantic states:

- **committed** — the last world accepted after successful artifact execution;
- **draft** — the staged world that `define()`, `patch()`, and `remove()` mutate immutably.

The committed world never changes merely because a draft exists.

## Construction

```js
const reality = new RealitySession({
	artifactExecution,
	request: {
		required: ['visual', 'collision']
	}
});
```

`artifactExecution` is the existing artifact execution authority used by the procedural-language stack. It must provide `plan()` and `compile()`; `RealitySession` does not create a second compiler or cache system.

## Stage whole Definitions

```js
reality.define({
	id: 'tree',
	kind: 'biology.tree',
	payload: {
		age: 7
	}
});
```

A newly added Definition regenerates all currently requested channels. Replacing an existing Definition with `define()` deliberately does not fabricate patch precision; when exact affected-channel evidence is unavailable, selective lineage stays conservative.

## Stage precise patches

```js
reality.patch(
	'tree',
	[
		{
			op: 'set',
			path: 'payload.age',
			value: 8
		}
	],
	{
		affects: ['collision']
	}
);
```

`patch()` uses the existing atomic patch transaction authority and stores its real receipt. The receipt feeds selective artifact lineage, so a collision-only patch may regenerate `collision` while an unchanged `visual` artifact remains fresh.

## Plan and explain without execution

```js
const transition = reality.plan();
const explanation = reality.explain();
```

These operations compute committed-to-draft semantic impact and artifact consequences without invoking compilers or committing the world.

## Compile versus apply

```js
const preview = await reality.compile();
const committed = await reality.apply();
```

`compile()` materializes the draft transition but intentionally leaves committed semantic state and the session revision unchanged.

`apply()` executes first and commits the draft only after required artifact execution succeeds. When an unchanged draft was already materialized by `compile()`, `apply()` can fresh-skip instead of compiling the same artifact twice.

If execution throws, committed semantic hashes and revision stay unchanged, the draft remains available for retry, pending patch receipts remain available, and failed replacement freshness stays stale until a real retry succeeds.

## Reset and retire

```js
reality.reset();
reality.remove('tree');
await reality.apply();
```

`reset()` discards staged semantic changes and pending patch receipts while preserving valid artifact freshness evidence. `remove()` stages retirement; applying a removal retires freshness/materialization records for that Definition instead of compiling it again.

## Inspect portable state

```js
const state = reality.snapshot();
```

The snapshot is deterministic, frozen, JSON-safe, and excludes opaque runtime artifact objects. It reports session revision, dirty state, pending patch count, committed/draft semantic and dependency hashes, Definition ids, and portable freshness evidence.

## Incremental truth

Freshness is not a boolean promise. A channel may skip work only when its output-relevant witness still agrees with the materialized runtime artifact: Definition identity, canonical artifact request, compiler plan/version manifest, concrete causal upstream identities, and explicit execution identity where supplied.

That is the central invariant: unrelated world edits do not force needless rebuilds, causal changes do, and a process restart cannot pretend an opaque runtime artifact still exists merely because portable JSON remembers yesterday's evidence.
