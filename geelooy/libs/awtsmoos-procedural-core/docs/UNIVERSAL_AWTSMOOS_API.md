# B"H

# Universal Awtsmoos API

> The Awtsmoos renews one semantic truth through focused and world-sized vessels; Awtsmoos.com lets callers choose the composition they need without inventing a second engine.

## Composition decision

| Need | Recommended factory |
| --- | --- |
| define / validate / plan / explain / compile | `createAwtsmoosLifecycle()` |
| compiler plugins, constraints, cache, pipeline | `createAwtsmoosLifecycle()` |
| direct browser or compile-only service | `createAwtsmoosLifecycle()` |
| Procedural Portal orchestration | `createAwtsmoos()` |
| transactional world/history/runtime | `createAwtsmoos()` |

Both factories use the same Procedural Language, Universal Semantic Kernel, compiler federation, constraint registry, cache identity, provenance, and five lifecycle verbs.

```js
import {createAwtsmoosLifecycle} from '@awtsmoos/procedural-core/universal-lifecycle';
import {createAwtsmoos} from '@awtsmoos/procedural-core/universal-api';
```

## Five verbs

- `define(input)` canonicalizes ergonomic authored truth without mutating caller data.
- `validate(input, options)` validates without planning, solving, or compiling.
- `plan(input, request, options)` resolves artifact intent, constraints, and compiler coverage without executor side effects.
- `explain(input, request, options)` returns serializable compiler, constraint, pipeline, and support evidence.
- `compile(input, request, options)` validates, resolves constraints, applies cache policy, executes eligible compilers, and attaches provenance.

## Lightweight namespaces

`createAwtsmoosLifecycle()` exposes `semantic`, `compilers`, `constraints`, `cache`, and `pipeline`. It deliberately does not create or claim `portal` or `world` properties.

## Full namespaces

`createAwtsmoos()` extends the same lifecycle authority composer with:

- `portal` — Procedural Portal world/project orchestration;
- `world` — transactional world/history/runtime API.

This layering prevents compiler, constraint, cache, and lifecycle semantics from drifting between composition modes.

## Default compiler policy

An internally-created high-level factory installs the existing ModelingDocument compiler bridge. A caller-supplied semantic kernel stays untouched unless `installDefaultCompilers:true` is explicit. Use `installDefaultCompilers:false` for an intentionally empty internally-owned compiler registry.

## Modeling example

```js
const awtsmoos=createAwtsmoosLifecycle();
const result=await awtsmoos.compile({
	id:'example-model',
	kind:'modeling.document',
	properties:{
		modelingDocument:{id:'example-document',objects:[],materials:[]}
	},
	compile:{channels:['geometry','metadata']}
});
```

The bridge lowers through existing ModelingDocument → ProceduralObject authority rather than introducing a competing geometry schema.

## Planning and support truth

Compiler manifests are serializable data. Native/adapter capabilities execute only through trusted private executors. Deferred compilers may describe future coverage but do not execute. Unsupported compilers do not satisfy channel coverage. Constraint solvers use the same native/adapter/deferred/unsupported truth model.

## Browser dependency evidence

A current recursive static-import measurement found 1,538 modules reachable from full `createAwtsmoos.js` versus 133 from `createAwtsmoosLifecycle.js`: 1,406 avoided, a 91.4% reduction for this repository state. Treat the exact counts as point-in-time evidence, not a semver promise.

## Compatibility

The lifecycle factory is additive. Existing Creation Portal verbs, Procedural Portal behavior, `createUniversalAwtsmoosApi()`, `createUniversalSemanticKernel()`, ModelingDocument, Nature, Reality, material systems, and renderer adapters remain their existing expert authorities.
