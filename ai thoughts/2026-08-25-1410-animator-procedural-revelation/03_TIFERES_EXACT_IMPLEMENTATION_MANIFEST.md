B"H

# Tiferes Exact Implementation Manifest — Extreme Power, Simple Gate

The Awtsmoos joins unlimited possibility to exact vessels; Awtsmoos.com should let a child choose “forest” while an expert or AI can direct seeds, morphology, texture, wind, bounds, performance, and quality without the surface becoming a cockpit of noise.

## Thirty-Five Final Corrections Before Code

1. Do not create a second random function; wrap existing deterministic math in a semantic seeded stream.
2. String seeds must hash deterministically through existing `AwtsmoosMath.hashString`.
3. Generator outputs must be pure data/VirtualGraph nodes only.
4. Every output gets recipe version, generator type, seed, quality, bounds, and anchors.
5. Draft quality must cap expensive detail aggressively.
6. Balanced quality becomes the default.
7. Cinematic quality may add veins/facets/secondary detail but still has hard budgets.
8. All densities must be clamped.
9. All recursive depths must be clamped.
10. All remote texture byte sizes and MIME types must be bounded.
11. No remote texture provider may execute scripts or HTML.
12. Remote generation must never be required for a valid local scene.
13. Remote texture URLs must use HTTPS unless an explicit local-development policy permits otherwise.
14. Provider classes return descriptors, not DOM image elements.
15. Material descriptions must stay renderer-agnostic.
16. Rock geometry must expose a ground anchor.
17. Tree geometry must expose root/crown anchors.
18. Flowers must expose stem/base/bloom anchors.
19. Grass patches must expose ground bounds and wind metadata.
20. Creatures must expose semantic head/eyes/mouth/hands/feet anchors.
21. Creature recipes must include expression/performance compatibility metadata.
22. Registry lookup must provide supported-type hints on failure.
23. `UniversalBuilder` must not silently swallow malformed procedural recipes.
24. Scene group recursion must tolerate absent/invalid children without crashing.
25. Array modifiers must have hard count limits to prevent accidental explosion.
26. World generator registration must be data-driven, not a growing if/switch chain.
27. Ground clutter must compose shared generators rather than duplicate pebble art.
28. Existing tree cache remains a valid optimization path for background/low-detail trees.
29. Tree profiles choose between lightweight graph, cached recursive, and detailed leaf modes by quality.
30. Creator UI only receives procedural controls after the data/API core is functional.
31. Creator procedural UI must start collapsed on mobile and desktop.
32. Agent procedural commands must be preview-only until an explicit apply route can reuse shared NLE transaction semantics.
33. All new CSS must be imported through existing local creator/style entrypoints.
34. Final verification must search for `:root`, raw `body/html`, unbounded z-index, and overflow-prone fixed widths.
35. Every touched source file must be reread fully after implementation and split further if it breaches the 120-line law.

## Source Wave A — Shared Procedural Core

1. `src/world/generation/core/ProceduralSeed.js`
	- Semantic seeded stream with `next`, `between`, `integer`, `pick`, `fork`.
2. `src/world/generation/core/ProceduralQuality.js`
	- Draft/balanced/cinematic node/detail budgets.
3. `src/world/generation/core/ProceduralBounds.js`
	- Bounds normalization and containment helpers.
4. `src/world/generation/core/ProceduralPalette.js`
	- Shared cartoon/natural palettes and safe overrides.
5. `src/world/generation/core/ProceduralGenerator.js`
	- Abstract base class: normalize → generate; descriptive capability contract.
6. `src/world/generation/core/ProceduralGeneratorRegistry.js`
	- Registry and discovery for generator families.

## Source Wave B — Nature Families

7. `src/world/generation/nature/rock/RockProfileCatalog.js`
8. `src/world/generation/nature/rock/RockGenerator.js`
	- Faceted seeded silhouettes, erosion, moss, scale/bounds metadata.
9. `src/world/generation/nature/flower/FlowerProfileCatalog.js`
10. `src/world/generation/nature/flower/FlowerGenerator.js`
	- Petal rings, golden-angle clusters, deterministic variation.
11. `src/world/generation/nature/GrassGenerator.js`
	- Whole-file rewrite using quality budgets, clumps, bounded blades, palette, wind.
12. `src/world/generation/nature/tree/TreeProfileCatalog.js`
13. `src/world/generation/nature/TreeGenerator.js`
	- Whole-file rewrite with species profiles, deterministic crown morphology, anchors, quality tiers.
14. `src/world/generation/nature/ProceduralNatureForge.js`
	- Whole-file rewrite as small registry facade; no species if-chain.
15. `src/world/generation/terrain/GroundClutter.js`
	- Whole-file rewrite composing rock/grass/flower families.

## Source Wave C — Creature Family

16. `src/world/generation/creature/CreatureProfileCatalog.js`
17. `src/world/generation/creature/CreatureGenerator.js`
	- Cartoon creature morphology with semantic anchors and performance-channel metadata.

## Source Wave D — Texture System

18. `src/world/generation/texture/TextureRequest.js`
	- Versioned material request normalization.
19. `src/world/generation/texture/TextureSafetyPolicy.js`
	- HTTPS/MIME/size/provider validation.
20. `src/world/generation/texture/TextureCacheKey.js`
	- Stable deterministic content key.
21. `src/world/generation/texture/TextureProvider.js`
	- Abstract provider contract.
22. `src/world/generation/texture/LocalTextureProvider.js`
	- Deterministic renderer-agnostic procedural material descriptor.
23. `src/world/generation/texture/RemoteTextureProvider.js`
	- Configured HTTPS JSON provider adapter with timeout/response validation and local fallback metadata.
24. `src/world/generation/texture/TextureService.js`
	- Provider registry and simple `resolve(request)` facade.

## Source Wave E — World/Scene Integration

25. `src/world/generation/UniversalBuilder.js`
	- Registry-based procedural delegation plus existing chair compatibility.
26. `src/world/generation/SceneJSONEngine.js`
	- Split readable parse/process/array/group behavior; routes base entities through `UniversalBuilder`.

## Source Wave F — Canonical Agent API

27. `src/ai/agent/ProceduralWorldService.js`
	- Data-only preview generation and capability descriptor.
28. `src/ai/agent/AnimatorCapabilityManifest.js`
	- Add world/nature/texture/creature capabilities.
29. `src/ai/agent/AnimatorCommandValidator.js`
	- Validate `world.preview` payloads and bounded generation counts.
30. `src/ai/agent/AnimatorCommandRouter.js`
	- Add `scene.compile`, `performance.compose`, and `world.preview` without duplicating state ownership.

## Source Wave G — Root-Isolated UI

31. `src/ui/chrome/AnimatorRoot.js`
32. `src/ui/chrome/ChromePanelState.js`
33. `src/ui/chrome/ChromeKeyboardRouter.js`
34. `src/ui/chrome/ChromePlaybackView.js`
35. `src/ui/chrome/ResponsiveChrome.js`
	- Rewrite as compact coordinator mounted under animator root only.
36. `src/core/app/AppUI.js`
	- Mark root before shell mount.
37. `src/ui/creator/CreatorDock.js`
	- Mount inside animator root and route procedural preview controls.
38. `src/ui/creator/CreatorTemplate.js`
	- Add one collapsed Procedural World section: type, prompt/seed, quality, preview.

## Source Wave H — Localized CSS

39. `src/styles/base/tokens.css`
40. `src/styles/base/reset.css`
41. `src/styles/mobile/responsive.css`
	- Remove every document-global selector/state dependency.
42. `src/styles/creator/creator-shell.css`
43. `src/styles/creator/creator-controls.css`
44. `src/styles/creator/creator-motion.css`
45. `src/styles/creator/creator-mobile.css`
46. `src/styles/creator/creator-world.css`
	- New local procedural section styling, fully stateful and mobile-first.
47. `src/styles/creator.css`
	- Import the new local module.

## Documentation After Source

48. `AGENT_API.md`
49. `PROCEDURAL_WORLD_API.md`
50. `DOCUMENTATION.md`

## Tests Only After All Source/Docs Are Written

- deterministic generator smoke;
- procedural budget/bounds smoke;
- texture safety/provider smoke;
- agent world-preview smoke;
- local-style-scope smoke;
- existing package smoke suite;
- browser console + desktop/tablet/phone + overflow/z-index + reduced-motion inspection.

## NEXT_ACTION
Begin Wave A now. Write all shared core files completely, then Wave B, and do not run tests until the source/docs pass is finished.
