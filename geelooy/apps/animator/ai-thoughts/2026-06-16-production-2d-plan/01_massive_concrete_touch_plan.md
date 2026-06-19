B"H

# Massive Concrete Touch Plan — Production 2D Cartoon / Healthy Eating Demo

## Mission

Replace the broken sky-floating demo with a production-style 2D cartoon scene that proves the engine can stage characters, food, props, depth lanes, camera grammar, and object interaction. The next pass should not merely tune camera numbers. It must introduce a real staging architecture.

## Hard rules

- No partial patches.
- Every modified file is rewritten whole.
- Split aggressively into small modules.
- Keep files under 120 lines when practical.
- Verify with real commands.
- Do not pretend production quality is finished; build a concrete foundation.

## Exact file touch plan

### A. New production scene folder

1. `src/data/scenes/healthyLunch/metadata.js`
   - Scene identity, duration, visual style, world floor, table anchor, camera policy.
   - Purpose: replace city rooftop nonsense with a kitchen/table environment.

2. `src/data/scenes/healthyLunch/characters.js`
   - Kid, parent/guide, apple character, carrot character, sandwich character.
   - Purpose: give humans and food-actors grounded starting positions.

3. `src/data/scenes/healthyLunch/props.js`
   - Plate, lunchbox, table, fork, cup, sparkle effects, crumbs, apple, carrot, sandwich pieces.
   - Purpose: objects become part of story instead of disconnected circles.

4. `src/data/scenes/healthyLunch/cameras.js`
   - Establishing, table medium, kid medium, food insert, group celebration.
   - Purpose: remove giant closeup flooding and force safe cinematic framing.

5. `src/data/scenes/healthyLunch/beats.js`
   - Concrete story beats:
     - table establishing
     - kid sees lunchbox
     - apple hops forward
     - carrot rolls and waves
     - sandwich opens like puppet
     - kid takes bite
     - celebration
   - Purpose: prove eating/object interaction, not just talking.

6. `src/data/scenes/healthyLunch/index.js`
   - Assembles metadata, characters, props, cameras, and beats through compiler.
   - Purpose: modular scene loader pattern.

### B. New stage/composition systems

7. `src/staging/DepthLaneRegistry.js`
   - Defines foreground, table, actor, prop, background lanes.
   - Purpose: nothing floats; every entity belongs to a depth lane.

8. `src/staging/StageAnchorResolver.js`
   - Resolves anchors like `tableTop`, `floor`, `plateCenter`, `handLeft`.
   - Purpose: object placement is semantic, not random x/y.

9. `src/staging/CompositionRules.js`
   - Rules for safe framing: feet visible, head not clipped, eyes upper third, max zoom.
   - Purpose: cameras stop destroying the image.

10. `src/staging/GroundingSolver.js`
    - Converts scene anchors/lane info into stable y positions.
    - Purpose: no more people standing on buildings/air.

11. `src/staging/SceneStagingSystem.js`
    - Main staging API combining lanes, anchors, composition, grounding.
    - Purpose: one stable production staging vessel.

### C. New interaction/action systems

12. `src/director/actions/ActionGrammar.js`
    - Defines supported verbs: lookAt, pickUp, hold, bite, chew, hop, roll, bounce, celebrate.
    - Purpose: story actions become explicit.

13. `src/director/actions/InteractionCompiler.js`
    - Turns beat-level verbs into character/prop events.
    - Purpose: `kid bites apple` becomes mouth, hand, prop, reaction events.

14. `src/director/actions/FoodActionPresets.js`
    - Apple hop, carrot roll, sandwich puppet-open, sparkle celebration.
    - Purpose: food becomes animated cast.

15. `src/director/actions/HeldPropMapper.js`
    - Maps held props to character hand/body positions.
    - Purpose: props do not float beside people.

### D. Renderer additions for production 2D richness

16. `src/core/renderer/scene/FoodKitchenBackdrop.js`
    - Draws table, kitchen wall, window, shelves, warm flat 2D shapes.
    - Purpose: replace city skyline for this demo.

17. `src/core/renderer/scene/LayeredSceneRenderer.js`
    - Draws background, table, props behind, characters, props front, effects.
    - Purpose: real 2D production layering.

18. `src/core/renderer/props/FoodPropRenderer.js`
    - Draws apple, carrot, sandwich, plate, lunchbox with rich 2D detail.
    - Purpose: objects look intentional.

19. `src/core/renderer/props/PropAttachmentRenderer.js`
    - Draws props attached to hands or plate anchors.
    - Purpose: object-character contact.

20. `src/core/renderer/effects/CartoonEffectsRenderer.js`
    - Draws sparkles, motion lines, squash/stretch cues, bite crumbs.
    - Purpose: production-like cartoon energy.

21. `src/core/renderer/camera/ShotCompositionGuard.js`
    - Applies composition safety to camera target/zoom.
    - Purpose: no giant faces, no cut feet.

### E. Rewrite existing integration files

22. `src/core/app/DefaultSceneInstaller.js`
    - Rewrite to install healthy lunch scene as default.
    - Purpose: user sees the new production demo immediately.

23. `src/director/dialogue/DialogueBeatCompiler.js`
    - Rewrite or split to include interaction compilation.
    - Purpose: beats can include actions beyond speech/prop throw.
    - If too large, split into helpers and keep this as a facade.

24. `src/core/app/director/logic/CharacterProcessor.js`
    - Rewrite to respect hold/bite/chew/reach action fields.
    - Purpose: characters physically interact with food.

25. `src/core/app/director/logic/PropProcessor.js`
    - Rewrite to support anchored props, held props, rolling, hopping, bite states.
    - Purpose: objects become alive and attached.

26. `src/core/app/director/logic/CameraProcessor.js`
    - Rewrite to route camera through composition guard.
    - Purpose: shot grammar enforcement.

27. `src/camera/core/CameraRigRegistry.js`
    - Rewrite only if needed to support new camera metadata like `safeShot`, `subjectPadding`, `anchorMode`.
    - Purpose: safe shot definitions.

28. `src/camera/MobileCameraMercy.js`
    - Rewrite only if needed to clamp healthy lunch cameras better on phone.
    - Purpose: mobile-safe shots.

29. `src/core/renderer/scene/Manager.js`
    - Rewrite if required to use layered kitchen renderer instead of current city logic.
    - Purpose: stop city/building layer from dominating.

30. `src/core/renderer/props/Manager.js` or current prop manager file found by inspection
    - Rewrite to call FoodPropRenderer and attachment renderer.
    - Purpose: render new prop categories.

31. `src/nle/ui/NLEInteractionSeal.js`
    - Rewrite again if current collapse still shows huge controls.
    - Purpose: make UI non-invasive during playback.

### F. AI generator schema groundwork

32. `src/generator/schema/CartoonSceneSchema.js`
    - Strict scene schema for production 2D prompt output.

33. `src/generator/schema/HealthyFoodSceneTemplate.js`
    - Template for healthy-eating scenes.

34. `src/generator/compiler/PromptToScenePlan.js`
    - Browser-local deterministic prompt stub, no API needed yet.

35. `src/generator/compiler/ScenePlanValidator.js`
    - Validates scene plan before engine accepts it.

36. `src/generator/compiler/ScenePlanToBeats.js`
    - Converts AI-style scene plan into beat modules.

37. `src/generator/CartoonGeneratorRoadmap.js`
    - Rewrite to reflect this new architecture.

### G. Verification files

38. `tools/verify/healthyLunchSmoke.js`
    - Asserts no character y below grounded threshold; cameras safe; props anchored; events compile.

39. `tools/verify/stagingSmoke.js`
    - Tests lane/anchor/grounding system.

40. `tools/verify/interactionSmoke.js`
    - Tests pickUp/hold/bite/chew/food-hop action compilation.

41. `tools/verify/renderModuleSmoke.js`
    - Imports renderers to ensure no broken module graph.

42. `package.json`
    - Add verify scripts and include in full verify.

### H. Planning and audit files

43. `ai-thoughts/2026-06-16-production-2d-plan/02_implementation_order.md`
44. `ai-thoughts/2026-06-16-production-2d-plan/03_risk_register.md`
45. `ai-thoughts/2026-06-16-production-2d-plan/04_after_write_review.md`

## Implementation order

1. Inspect current renderer prop/scene managers.
2. Create staging systems.
3. Create action grammar and interaction compiler.
4. Create healthyLunch scene modules.
5. Create renderers for kitchen, food props, effects.
6. Rewrite DefaultSceneInstaller.
7. Rewrite processors only as required by actual event shape.
8. Add verification.
9. Run `npm run verify`.
10. Reload browser and compare screenshots.

## Visual target

A 12-second cartoon:

- Kid at kitchen table.
- Lunchbox opens.
- Apple hops from plate.
- Carrot rolls and waves.
- Sandwich opens like a puppet mouth.
- Kid picks up apple.
- Kid bites.
- Sparkles and happy reaction.
- Camera remains safe and readable.

This is still pure 2D canvas. No 3D shaders. The realism comes from layered staging, contact, timing, squash/stretch, hand-prop attachment, and cinematic composition.
