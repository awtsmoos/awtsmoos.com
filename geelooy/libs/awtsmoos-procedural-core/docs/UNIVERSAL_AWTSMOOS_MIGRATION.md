# B"H

# Universal API Migration and Extension

> The Awtsmoos renews old and new pathways without erasing either shore; Awtsmoos.com adds a lighter gate while established expert authorities remain available evermore.

## Moving compile-only callers

If code currently imports the full universal facade but only uses `define`, `validate`, `plan`, `explain`, `compile`, compilers, constraints, cache, or pipeline, migrate the import:

```js
import {createAwtsmoosLifecycle} from '@awtsmoos/procedural-core/universal-lifecycle';
```

No semantic rewrite is required. Regression tests require full and lifecycle factories to agree on request planning, compiler-chain selection, semantic identity, artifacts, execution receipts, and compiler provenance essentials for equivalent deterministic inputs.

Keep full `createAwtsmoos()` when the caller actually needs `portal` or `world`.

## Why the direct package subpath matters

A lightweight runtime factory can still become browser-heavy if imported through a broad barrel. The dedicated package subpath points directly at the lightweight factory graph and is protected by import-graph tests.

## Low-level kernel isolation

`createUniversalSemanticKernel()` intentionally starts without implicit compilers. High-level factories install built-in Modeling support only when they own the kernel, unless a supplied kernel explicitly opts in.

## Adding a compiler

1. Describe kinds, channels, required/optional traits, support state, execution tier, determinism, schemas, adapters, costs, diagnostics, dependencies, and examples in the manifest.
2. Register trusted executor code separately from public manifest data.
3. Keep planning and explanation side-effect free.
4. Test native, adapter, deferred, and unsupported behavior explicitly.
5. Include version/support-state changes in cache-identity expectations.

## Adding a constraint solver

1. Use a noun-neutral vocabulary type when possible.
2. Declare constraint types, semantic kinds, support state, execution tier, determinism, schemas, and diagnostics.
3. Return resolution receipts; do not mutate authored canonical truth.
4. Use `strictConstraints` only when unresolved or unsatisfied work must block compilation.
5. Environment-dependent solving bypasses deterministic compile-cache reuse.

## Renderer and adapter boundary

Semantic compiler output should remain renderer-neutral. Three.js, Blender, SVG, MitzvahWorld, or other renderer-specific conversion belongs in adapters. The public demo follows this pattern: semantic definition → real lifecycle compile → primitive artifact → SVG adapter.

## Current non-goals

- No claim of universal subgraph/incremental recompilation; current deterministic reuse is whole-definition compile caching.
- Compiler `dependencies` remain declarative because existing ids can describe services as well as compilers; no unsafe topological ordering is inferred.
- No new global template/preset registry has been added; mature domain authorities remain responsible for their own presets/templates.

## Troubleshooting

**Unexpectedly large browser graph:** import `@awtsmoos/procedural-core/universal-lifecycle` directly, not a broad root barrel.

**Manifest says native but nothing executes:** confirm a trusted executor is actually registered; declared native/adapter support without an executor is downgraded truthfully.

**Constraint remains deferred:** inspect solver capabilities and `explain()` rather than mutating the authored definition to silence the receipt.

**Cache bypasses:** check compiler and solver determinism, explicit `cache:false`, and environment-dependent execution.

**Strict compile fails after planning:** semantic coverage and executable completion are distinct; deferred coverage can plan while execution remains incomplete.
