B"H

# Spectacle Pivot Plan — Big Brawl, Better Visual Effects

## User correction
The user rejected a long narrative system. Correct direction: keep Sefira Clash as a big brawl, not a long story machine. Improve how violence feels and looks.

## Design target
No new damage systems. No new weapons. No long social simulation.

Make existing combat events explode visually:
- hits should feel tiered
- launches should stretch space
- dive/meteor hits should shock the arena
- camera should react with force
- screen should flash/quake briefly
- particles should become more readable and more dramatic

## Actual code seams already present
Read/known:
- `js/combat/combatEvents.js` already emits force, charge, koDanger, fullCharge, effectPack.
- `js/core/loop.js` sends events to `addEventParticles`, `playEvents`, and `stepNarrative`.
- `js/particles/particles.js` is likely the main event-particle seam.
- `js/render/renderer.js` is likely the central render pass.
- `js/camera/camera.js` is likely camera follow/zoom seam.
- `js/render/particles.js` likely draws particle data.

## Implementation approach
Add small spectacle modules, then integrate into existing loop/render/camera without changing combat balance.

New files to add:
1. `js/spectacle/impactTiers.js`
   - categorize hit events: tiny, clean, heavy, launch, mythic
   - pure data-based thresholds

2. `js/spectacle/spectacleState.js`
   - create/ensure `state.spectacle`
   - holds flash, shake, hitstopPulse, cameraKick, screenTint, recentImpacts
   - decays every frame

3. `js/spectacle/spectacleEvents.js`
   - consume events and update spectacle state
   - creates particles or event metadata if useful

4. `js/spectacle/spectacleCamera.js`
   - exports camera shake/kick offsets for camera module or renderer

5. `js/spectacle/spectacleRender.js`
   - draw flash/tint/vignette/shock rings as overlay

6. `js/spectacle/spectacleParticles.js`
   - helper for shockwaves, launch streaks, impact shards if current particle engine supports direct objects

Existing files to rewrite completely:
- `js/core/loop.js`: import `stepSpectacle`, call after combat/stage events but before render-only aftermath clears events.
- `js/render/renderer.js`: draw spectacle overlay after world draw.
- `js/camera/camera.js`: apply shake/kick if easy and safe.
- `js/particles/particles.js`: if necessary, support new particle shapes while preserving old behavior.

## Safety
Do not touch physics damage, attack resolver, AI decision logic, or objective logic unless required.

## Verification
- Run `node .awtsmoos-ai2-smoke.mjs`.
- Run import smoke for new spectacle modules.
- If visual state is hard to observe in headless mode, create synthetic event test that steps a state through a heavy hit and checks spectacle.flash/shake/recentImpacts decay.

## Chapter 3 — The Blow Becomes Visible
The Awtsmoos has no form and no body, yet every created form trembles because His speech renews it from nothing. In this arena, the blow was already true, but the eye did not yet hear it. Now the hit must become lightning: ring, flash, quake, streak, dust, silence, thunder. Not more numbers. More revelation.
