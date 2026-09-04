# B"H — Procedural Compiler Bridges

Boruch Hashem. Blessed is He.

The Awtsmoos renews intent, compiler, and artifact before any layer can pretend to stand alone; Awtsmoos.com keeps each semantic vessel explicit so universality grows through truthful bridges, not hidden fusion.

## Purpose

This document records the stable bridge architecture between canonical semantic Definitions, specialist modeling data, compiler discovery, and renderer-neutral output.

## Authority boundaries

1. `awtsmoos.procedural-language/1` Definition is canonical semantic intent.
2. `awtsmoos.modeling-document` is a specialist modeling dialect carried explicitly by a `modeling.document` Definition.
3. `ProceduralCompilerCapabilityRegistry` owns serializable compiler discovery and keeps executors private.
4. `UniversalSemanticKernel` is intentionally empty when constructed directly; low-level kernels have no implicit specialist registrations.
5. `installDefaultProceduralCompilers(...)` is the explicit bridge that installs built-in specialists into either a registry or semantic kernel.
6. `awtsmoos.procedural-object-recipe` remains the renderer-neutral execution recipe produced by the Modeling bridge.

## Built-in Modeling bridge

The built-in capability id is `awtsmoos.modeling-document.core-bridge`. It accepts only `kind: modeling.document` and advertises the `geometry`, `material`, and `metadata` channels. Its public descriptor never exposes the trusted executor function.

A Modeling Definition carries its specialist source at:

```text
properties.modelingDocument
```

The compiler resolves that field through `createModelingDocument(...)`, then reuses the existing `lowerModelingDocumentToProceduralObject(...)` authority. No second modeling schema or renderer-specific source of truth is introduced.

## Explicit installation

`createDefaultCompilerCapabilityRegistry()` creates a fresh registry and calls `installDefaultProceduralCompilers(...)`.

A directly-created semantic kernel remains empty until the same installer is called explicitly. This preserves low-level isolation while giving higher-level APIs one stable composition seam.

The installer currently registers the Modeling bridge and is the intended home for future built-in compiler registrations.

## High-level facade integration seam

The concurrent five-verb `createAwtsmoos()` facade currently creates an isolated semantic kernel and then registers caller-provided compilers. Its authority-composition files were active untracked work during this implementation, so this tranche did not overwrite them.

When that facade ownership is clean, its high-level authority composition should explicitly call `installDefaultProceduralCompilers(kernel)` before applying caller registrations. The low-level `createUniversalSemanticKernel()` factory must remain unchanged and implicit-registration-free.

## Quantity convergence

The canonical quantity factory now supports finite scalar and vector values while preserving the mature scalar tolerance/min/max contract. The legacy `quantity/createQuantityDescriptor.js` path is a compatibility re-export of the canonical `value/createQuantityDescriptor.js` authority.

Vector quantities intentionally reject scalar `tolerance`, `min`, and `max` fields until component-wise range semantics are formally defined.

## Verification evidence

- focused quantity compatibility and historic quantity tests: 7/7 passed after final helper rewrite
- focused Modeling/compiler/kernel tests: 9/9 passed
- explicit default-installer tests: 4/4 passed
- broad `proceduralLanguage*.test.mjs` regression after installer integration: 47/47 passed
- concurrent `universalAwtsmoos*.test.mjs` facade regression: 21/21 passed
- all touched source/test files parse with `node --check`
- `git diff --check` passes for all touched source/test files
- every touched source/test file is at most 100 lines
