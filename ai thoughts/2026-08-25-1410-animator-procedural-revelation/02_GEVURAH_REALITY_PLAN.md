B"H

# Gevurah Reality Plan — One World Grammar, Many Small Vessels

The Awtsmoos is infinite while every stable vessel receives a measured border; Awtsmoos.com already contains a world-generation civilization, so the task is to reveal its hidden grammar and make every future generator enter through one orderly gate.

## Observed Reality

- `world/generation/nature` already contains `GrassGenerator`, `LeafGenerator`, `TreeGenerator`, `ProceduralNatureForge`, and `EmojiNature`.
- `AwtsmoosNature` already caches recursive trees and quantizes variants to avoid OOM behavior.
- `TreeGenerator` creates a simple trunk plus 20 leaves; `LeafGenerator` creates 120 detailed leaves with 8 micro-veins each, so realism currently increases graph-node pressure sharply.
- `GrassGenerator` multiplies requested density by 15 and emits one path per blade.
- `GroundClutter` owns an unrelated pebble mini-generator instead of composing a shared rock family.
- `UniversalBuilder` only dispatches `chair`.
- `SceneJSONEngine` special-cases `house` and contains compressed array/group logic.
- `VirtualGraph` intentionally emits pure JSON-like geometry nodes; procedural generators should preserve that data-first boundary.
- The canonical AI-agent layer is `src/ai/agent`, already connected to the shared NLE store and preview-before-mutation workflows.

## Failure Map

1. Duplicate world APIs if new generators bypass `world/generation`.
2. OOM or frame collapse if realism is measured only by path count.
3. Nondeterminism if random semantics differ across generator families.
4. Art inconsistency if every generator owns arbitrary colors/material rules.
5. Floating geometry if outputs omit bounds/contact anchors.
6. Impossible agent automation if generators return DOM/canvas state rather than serializable recipes/results.
7. Remote-texture lock-in if provider details leak into morphology classes.
8. Security failure if arbitrary remote URLs, MIME types, or huge payloads are trusted.
9. Offline failure if remote generation has no local fallback.
10. Repetitive vegetation if variation is independent noise without morphology profiles.
11. Creature fragmentation if procedural bodies cannot use existing face/body performance channels.
12. Scene-parser bloat if each new type creates another `if` branch.
13. Mobile clutter if procedural controls are always visible.
14. CSS conflicts if new controls are styled outside the owned animator root.
15. Z-index escalation if every drawer invents its own layer number.
16. Accessibility loss if collapse/preview/apply controls work only by pointer.
17. Seed collisions if numeric/string identities are normalized inconsistently.
18. Unbounded recursion if tree/cluster profiles do not carry budgets.
19. Cache explosion if every tree seed creates a unique offscreen asset.
20. Silent malformed recipes if there is no common normalization/validation step.

## Realistic Architecture

### Shared Core

Create tiny modules for deterministic seeds, normalized recipes, bounds, quality budgets, palettes, and generator registration. Each module owns one responsibility and stays below the source-size law.

### Generator Families

Rock, flower, grass, tree, and creature families extend a common data-generator contract only where inheritance expresses a real common lifecycle: normalize recipe → build metadata → build graph/descriptor. Morphology itself remains composed from small helpers.

### Texture Family

Separate local material recipes from remote providers. Remote providers receive a sanitized request and return a safe URL/blob descriptor; morphology classes only receive a texture/material descriptor. No generator performs arbitrary fetch directly.

### World Orchestration

`ProceduralNatureForge` becomes a small registry-driven facade. `UniversalBuilder` delegates known procedural types through that facade. `SceneJSONEngine` delegates entity construction through `UniversalBuilder` instead of hard-coded houses.

### Agent Surface

The canonical agent router receives one `world.preview` command returning generated serializable world entities and metadata without mutating the project. A later `world.applyPreview` path may reuse the existing preview/apply covenant rather than inventing a second transaction model.

## Thirty Concrete Improvements

1. Normalize every seed from string or number through one service.
2. Add deterministic forked seed streams for morphology/material/motion.
3. Add quality tiers: draft, balanced, cinematic.
4. Add explicit node budgets per quality tier.
5. Add explicit bounds metadata.
6. Add ground/contact anchors.
7. Add style-profile field shared across generator families.
8. Add palette objects rather than scattered hex literals.
9. Add wind-response metadata rather than each generator inventing its own formula.
10. Add morphology recipe version.
11. Add generator capability descriptors.
12. Add generator registry instead of switches/if chains.
13. Add rock silhouette families.
14. Add rock facet/shadow grammar.
15. Add rock erosion and moss controls.
16. Add flower petal-count/ring/spiral controls.
17. Add flower cluster placement using deterministic golden-angle distribution.
18. Add grass clump descriptors with bounded blade counts.
19. Add grass patch variation without one-node-per-unbounded-density logic.
20. Add tree species profiles that reuse cached/recursive tree infrastructure.
21. Add tree crown density and wind metadata.
22. Keep heavy leaf micro-detail behind cinematic quality only.
23. Add creature body recipe skeleton that maps semantic parts to existing performance channels.
24. Add remote texture request schema.
25. Add remote texture safety policy.
26. Add remote provider base class for extension.
27. Add local fallback material generation.
28. Add deterministic cache key generation.
29. Rewrite `UniversalBuilder` as registry-driven delegation.
30. Rewrite `SceneJSONEngine` into parser/processor/modifier helpers.
31. Replace `GroundClutter` pebble geometry with the shared rock generator.
32. Add procedural types to canonical agent capabilities.
33. Add one compact world/procedural Creator section, collapsed by default.
34. Scope every new style beneath the animator root.
35. Verify deterministic equality for repeated seeded generation before any visual polish claim.

## NEXT_ACTION
Write the third Tiferes manifest with exact files and responsibilities, then perform the entire source-first implementation wave before creating tests.
