B"H

# Procedural Portal — Semantic Anything World Compiler

Boruch Hashem. Blessed is He.

The Awtsmoos renews intention, dependency, measure, and manifestation before any generated world can claim itself. Awtsmoos.com keeps that immense possibility usable through one small semantic doorway: describe what should exist, inspect the plan, then let specialist authorities reveal it without hiding provenance or inventing a second generator stack.

## Start here

```js
import { createProceduralPortal } from '@awtsmoos/procedural-core';

const portal = createProceduralPortal({
	seed: 'gan-eden',
	budget: 'mobile'
});

const result = await portal.create({
	kind: 'tree',
	species: 'oak'
});
```

The ordinary surface is intentionally small:

- `create(intent, options)` — plan and compile one semantic root.
- `world(initial)` — open an additive authoring session.
- `plan(intent, options)` — validate and measure without specialist execution.
- `compile(intentOrPlan, options)` — execute a trusted plan or fresh semantic intent.
- `describe(kind?)` — discover kinds, capabilities, and inspector schemas.
- `with(overrides)` — derive an independent Portal with additional kinds/services/defaults.

## World sessions

```js
const world = portal.world();
world.add({ id: 'oak-one', kind: 'tree', species: 'oak' });
world.add({ id: 'rock-one', kind: 'rock', value: 'fieldstone' });

const plan = world.plan();
const compiled = await world.compile();
```

An empty session is a valid draft container, but `plan()` and `compile()` reject zero semantic roots. Add at least one root before execution.

## Deterministic identity

Aliases resolve before anonymous IDs are hashed, so equivalent `tree` and canonical tree-kind intent share semantic identity. Each node receives a hierarchical seed path derived from its parent identity rather than consuming global random sequence. Adding an unrelated sibling therefore does not silently reshuffle existing branches.

Callers may provide explicit `id` and `seed` values when identity must survive external persistence or editing.

## Dependencies and dry-run planning

Kinds may declare nested dependency recipes or direct `dependsOn` node IDs. Planning expands them into a finite directed acyclic graph, rejects missing references, conflicting IDs, cycles, excessive depth, and excessive node count, then stores deterministic dependency-before-dependent order.

`PortalPlan` records roots, graph evidence, order, demand, budget assessment, warnings, and a stable plan hash. Planning does not execute specialist compilers.

## Budgets and demand

Built-in profiles are `preview`, `mobile`, `gameplay`, and `cinematic`. They bound dimensions including graph depth, nodes, entities, geometry vertices, texture memory, and simulation time. Specialist estimators may contribute richer demand evidence; kinds without estimators receive a conservative baseline rather than fabricated precision.

Budgets reject declared over-demand before compilation. They are resource-planning evidence, not an execution sandbox.

## Compilation and persistence

Specialist compilers receive canonical recipe data, completed dependency results, the trusted plan, and explicit injected services. Runtime-heavy results remain in `PortalCompileResult`.

The persisted Universal world document stores lightweight semantic handles instead of copying heavyweight meshes, cyclic runtime objects, providers, or renderer state. `result.explain(id)` exposes kind, seed path, recipe, recipe hash, dependencies, fallback evidence, result type, and plan hash.

## Inspector schemas

Every semantic kind may publish renderer-neutral fields. Core field kinds currently include `text`, `number`, `integer`, `boolean`, `select`, `seed`, and `json`.

```js
const tree = portal.describe('tree');
const groups = tree.inspector.groups;
```

Fields carry labels, descriptions, common/advanced disclosure level, groups, defaults, options, bounds, steps, and required state. UI renderers should consume this data rather than hardcoding domain choices.

## Add a semantic kind

```js
const extended = portal.with({
	kinds: [{
		kind: 'my.castle',
		aliases: ['castle'],
		description: 'Plans one deterministic castle.',
		fields: [],
		estimator: recipe => ({ entities: 1 }),
		compiler: async context => buildCastle(context.recipe)
	}]
});
```

A kind may provide `compiler`, `dependencyFactory`, `estimator`, `fallback`, aliases, fields, capability metadata, version, stability, and sync/async mode. Registry extension is instance-local; it does not mutate an existing Portal.

## Fallback law

Fallback is never an implicit catch-and-substitute path. A kind must explicitly declare `fallback`. When used, the result records that fact plus the primary failure evidence. If the fallback also fails, Portal errors preserve the `fallback` phase.

## Trust boundary

Portal kind callbacks (`compiler`, `dependencyFactory`, `estimator`, `fallback`) are **trusted executable JavaScript** in the current implementation. They run in the host realm. A malicious or accidental infinite loop cannot be preempted by Portal budgets after it enters that callback.

Procedural-object plugin manifests already model trust levels, permissions, signatures, resource budgets, and execution modes such as `sandboxed`, but those modules are declaration/policy authorities and explicitly do not import or execute plugin code. Do not treat the `sandboxed` label itself as process isolation.

Untrusted third-party Portal generators require a real host capability boundary—such as a worker/process/realm executor with termination and resource enforcement—before their callbacks are installed.

## Mitzvah World extension pattern

Mitzvah World derives a Portal and adds renderer-neutral `mitzvah.architecture.house`, `mitzvah.architecture.doorway`, `mitzvah.world.region`, and `mitzvah.world.village` kinds. Their inspector choices come from the live Eretz house, doorway, region, and village catalogs; their compilers delegate to existing game authorities and declare `mutatesWorld: false`.

That is the intended extension pattern: semantic data enters Portal; mature domain authority performs the work; runtime promotion remains a separate explicit host action.

## Current limits

Portal does not currently claim generic `stream`, `simulate`, `clone`, `delete`, or untrusted-plugin execution APIs. Add such verbs only when real adapters and lifecycle contracts exist. The small surface is deliberate: immense extensibility belongs in semantic kinds and specialist authorities, not in a facade full of speculative promises.
