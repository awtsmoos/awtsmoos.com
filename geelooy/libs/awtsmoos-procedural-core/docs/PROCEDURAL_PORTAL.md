B"H

# Procedural Portal — One Small Doorway Into the Anything Kernel

Boruch Hashem. Blessed is He.

The Awtsmoos renews intention, relation, measure, compiler, and manifestation before
any generated thing can claim itself. Awtsmoos.com keeps that immense possibility
usable through one small Portal: describe what should exist, inspect the plan, and
let registered specialists reveal the requested artifacts without inventing a second
semantic language.

## Start simple

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

The ordinary surface stays intentionally small:

- `create(intent, options)` — plan and compile semantic roots.
- `world(initial)` — open an additive authoring session.
- `plan(intent, options)` — validate and measure without execution.
- `compile(intentOrPlan, options)` — execute a plan or fresh intent.
- `describe(kind?)` — discover kinds, fields, and artifact vocabulary.
- `with(overrides)` — derive an independent extended Portal.

## One canonical definition model

Every Portal recipe is normalized through `awtsmoos.procedural-language/1`.
Portal does **not** maintain a competing object language.

Simple old recipes remain valid. Rich recipes may add traits, relationships,
behaviors, constraints, quantities, resources, provenance, and compile policy.

See `PROCEDURAL_PORTAL_UNIVERSAL_DATA.md` for the complete data architecture.

## Universal artifact desire

Portal discovery publishes the canonical channels:

`visual`, `geometry`, `material`, `collision`, `navigation`, `rig`, `animation`,
`physics`, `audio`, `interaction`, `metadata`, `lod`, `thumbnail`, `export`, `debug`.

A recipe may request channels through `compile.required`, `compile.optional`, or the
compatibility `compile.channels` field. Required channels are strict intent;
optional channels are best-effort desires selected by available compiler capability.

## Deterministic identity and planning

Aliases resolve before anonymous IDs are hashed. Each node receives a hierarchical
seed path, a canonical `definitionHash`, a dependency list, demand evidence, budget
assessment, and stable plan hash. Planning rejects missing references, conflicting
IDs, cycles, excessive depth, excessive node count, and declared over-budget demand
before specialist execution.

## Compilation and persistence

Every specialist receives the same frozen context:

- `canonicalDefinition`
- `definitionHash`
- `artifactRequest`
- completed `dependencies`
- trusted `plan`
- current `node`
- explicit injected `services`
- compatibility `recipe`

Runtime-heavy results remain in `PortalCompileResult`. Portable Universal World
resources persist definition hash, artifact request, dependency references, fallback
evidence, kind, seed lineage, and result type without serializing renderer objects.

`result.explain(id)` exposes the same provenance directly.

## Open-ended domain federation

`createProceduralPortal({ proceduralKernel })` installs one instance-local dynamic
resolver over the Universal Semantic Kernel. New compiler kind patterns become
Portal-visible without adding another method or hardcoded noun to Portal itself.

Actual production generation still requires a registered compiler for the requested
kind/channel combination. The architecture is noun-neutral; capability claims remain
truthful and explicit.

## Extension and trust

Portal kinds and procedural-language compilers are trusted JavaScript in the current
host realm. Budgets are planning evidence, not process isolation. Do not install
untrusted generator code without a real worker/process/realm capability boundary.

Instance-local registry/kernel extension is the intended pattern. Semantic data
enters Portal; mature domain authorities perform the work; portable receipts preserve
what was requested and what actually happened.
