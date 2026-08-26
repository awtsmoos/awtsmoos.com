B"H
# Authoring Pipeline

The Awtsmoos renews idea, recipe, graph, mesh, and manifested world while Awtsmoos.com lets human-readable intent descend through deterministic vessels without confusing authoring language with combat runtime.

## Goal
World building should become data-first. A designer should be able to describe a battlefield object or compound prop through validated modeling/recipe data, compile it through shared core, hash it deterministically, and manifest it through the native runtime without hand-writing one-off geometry code.

## Authoring-only boundary
These capabilities belong primarily in `tools/ohrfront-core/` and must not become browser startup dependencies:
- Blender adapter,
- modeling-language compiler and explanation APIs,
- MeshText compiler/tokenizer,
- Blender node parity metadata,
- export/parity reports.

## Modeling-language flow
1. Read declarative modeling document/text.
2. Compile with shared-core modeling language.
3. Validate operations and primitive vocabulary.
4. Lower to procedural-object or stable recipe data.
5. Validate the lowered recipe.
6. Create canonical JSON and stable hash.
7. Manifest native geometry during map assembly.
8. Record hash in diagnostics/evidence.

## MeshText flow
MeshText is used for compact procedural experiments and authored generators, not for hot combat-loop parsing.

Tool responsibilities:
- list registered generators,
- resolve a named generator,
- tokenize/compile authored source,
- preview resulting recipe/geometry evidence,
- reject invalid or unknown operations with clear messages.

## Stable recipes
Stable recipe hashes provide:
- reproducible battlefield evidence,
- cache/deduplication keys,
- regression witnesses,
- authoring change detection,
- handoff traceability.

Unstable JSON serialization must not be substituted for core canonical hashing.

## Geometry operations
Procedural geometry, modifiers, face/vertex queries, sculpting, booleans and CSG run during authoring or runtime assembly whenever possible. They do not belong in every rendered frame.

Good uses:
- blast openings,
- ruined wall cuts,
- trenches and berm profiles,
- masonry damage,
- selected-face material assignment,
- deterministic prop variation.

## Native node graph
Native node graph IR can describe bounded geometry/material procedures. CPU reference execution is valuable for validation, previews and small deterministic effects. Heavy arbitrary graph evaluation must not silently move into the combat hot path.

## Blender parity
Blender integration proves authoring parity and supports export workflows. It is never imported by the browser runtime.

`blenderParityReport.mjs` should report:
- supported operations,
- unsupported/degraded operations,
- material/node differences,
- recipe hashes,
- actionable mismatches.

## Tool file plan
- `ChochmahModelingCatalog.mjs`
- `compileBattlefieldModel.mjs`
- `validateMeshRecipes.mjs`
- `meshTextPreview.mjs`
- `blenderParityReport.mjs`

Each tool remains a small CLI facade over deeper reusable modules.

## Verification
- compile a known modeling document deterministically,
- reject malformed authoring data,
- stable hash remains stable across equivalent canonical data,
- MeshText registered generator can compile a fixture,
- native lowered recipe produces expected geometry evidence,
- Blender tooling stays absent from browser dependency graph,
- no tool file exceeds the modularity ceiling.
