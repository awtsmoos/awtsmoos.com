B"H

# Chesed Capability Universe — Animator + Procedural Creation Core

The Awtsmoos renews every leaf, pebble, expression, and frame; Awtsmoos.com should let one clean data sentence unfold into a living cartoon world without forcing the creator to learn a maze of internal names.

## Ultimate Product Shape

The animator should feel simple first and immense second. A new creator sees stage, create, animate, preview, export. Advanced drawers reveal rigging, expressions, procedural worlds, camera, texture, timing, automation, and agent data only when summoned.

## Procedural Core Universe

1. One `AwtsmoosProcedural` facade for all procedural creation.
2. Data-only recipes that serialize cleanly and can be authored by humans or AI agents.
3. Deterministic seeded generation for reproducible worlds.
4. Rock generator with silhouette families, fracture language, erosion, strata, clustering, moss/lichen masks, edge wear, and style profiles.
5. Tree generator with trunk taper, recursive branching, crown grammar, leaf clusters, wind response, age, species profiles, seasonal palettes, roots, and silhouette controls.
6. Flower generator with phyllotaxis, petal layers, radial/asymmetric blossoms, stems, leaves, cluster density, bloom variation, lifecycle stage, and wind response.
7. Grass system with clump grammar, density fields, blade curvature, seed heads, species mixes, wind waves, collision flattening, and camera-aware simplification.
8. Creature creator with body graph, limb families, symmetry/asymmetry, eyes, mouths, ears/horns/wings/tails, expression channels, gait, idle motion, and style constraints.
9. Texture system with local procedural texture nodes and optional remote texture-provider adapters.
10. Remote texture requests described as data: semantic prompt, material class, scale, tileability, style, seed, channel outputs, attribution/source metadata, and cache key.
11. Generated texture channels for color, roughness, height/normal-like relief, mask, grain, edge breakup, veins, bark, stone, leaf, fur, feather, and soil patterns.
12. Flower, tree, rock, grass, and creature generators share a common seeded noise/randomness covenant.
13. Every generator returns a recipe, generated geometry/appearance data, semantic tags, bounds, and capability metadata.
14. LOD tiers for dense vegetation and background creatures.
15. Style adapters so the same procedural recipe can render as flat cartoon, inked, cut-paper, painterly, soft-vector, or existing project style.
16. Animation hooks: wind, growth, breathing, blink, sway, secondary motion, impact reaction, squash/stretch.
17. Scene ecology rules: rocks cluster near terrain seams, grass respects masks, flowers form patch grammars, trees respect spacing/canopy, creatures receive navigation anchors.
18. Remote texture generation never blocks core generation; placeholder/procedural fallback is deterministic.
19. Texture caching with stable content keys and explicit invalidation/versioning.
20. Provider-agnostic remote texture interface: no generator knows HTTP details.
21. Security boundary for remote URLs and generated assets: allowlisted protocols/types, size limits, timeout, MIME checks, no execution.
22. Agent API commands for generate/preview/apply procedural assets.
23. Preview-before-apply for destructive project mutations.
24. Batch generation for forests, flower fields, rock beds, creature crowds, and prop families.
25. Variation grammar so a population looks related but not cloned.
26. Scene-aware scale and grounding to prevent floating roots, buried props, or offscreen placements.
27. Bounds-aware layout so generated objects never escape stage/viewport unintentionally.
28. Mobile-first procedural UI: one compact Generate drawer, presets first, advanced controls nested by category.
29. Every control has hover, focus-visible, active, selected, disabled, loading, invalid, and reduced-motion behavior where relevant.
30. All CSS strictly nested under the animator root and imported through owned entry stylesheets.
31. One documented z-index scale local to the animator root.
32. No fixed body overlays; owned drawers live inside the animator root.
33. Futuristic motion uses transform/opacity, not layout thrash.
34. Dense procedural previews virtualize or debounce rather than freezing the editor.
35. API documentation includes five-line beginner recipes and exact advanced schemas.
36. Capability discovery lets agents ask which generators, textures, animation hooks, and provider adapters exist.
37. The procedural engine is independent from the UI and renderer through adapters.
38. Every generator module remains small, documented, tab-indented, and deterministic.
39. Inheritance is used only for real generator/provider families; composition connects noise, geometry, style, texture, and animation services.
40. Tests verify deterministic output, bounded geometry, serialization, cache behavior, safe remote handling, and UI isolation.

## User Experience North Star

A creator should be able to type or choose: `ancient windy apple tree beside three mossy rocks with wildflowers`, preview it, adjust one or two high-value sliders, and apply it. An AI agent should be able to produce the same scene using a small JSON recipe. Both paths must converge on the same data core.

## NEXT_ACTION
Inspect the live source for procedural/nature/texture/generator systems before deciding whether to extend existing families or create a new core.
