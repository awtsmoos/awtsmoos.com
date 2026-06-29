# B"H

# Specific Touch Plan

Files to add:

1. `src/data/scenes/default/outdoorProfessional/ProfessionalWorkshopWorld.js`
   - Outdoor scene identity, environmental memory, rain, puddles, mud, wind, fog, lighting.

2. `src/data/scenes/default/outdoorProfessional/LivingCharacters.js`
   - Mentor, apprentice, client, and two extras with goals, fears, confidence, curiosity, fatigue, trust, attention, gaze, breathing, posture, balance, momentum, anticipation, recovery, idle acting, interruptions, emotional transitions, conversational timing.

3. `src/data/scenes/default/outdoorProfessional/FacialPerformance.js`
   - Procedural facial maps for blinks, saccades, pupils, jaw, cheeks, lips, smiles, brows, breath, anticipation.

4. `src/data/scenes/default/outdoorProfessional/EnvironmentalDynamics.js`
   - Dynamic puddles, footprints, mud, wetness, dripping, cloth saturation, grass, leaves, ropes, lanterns, fog, rain, reflected light.

5. `src/data/scenes/default/outdoorProfessional/ReactiveCrowd.js`
   - Crowd extras destination, attention target, curiosity, avoidance, conversation, emotional contagion, recovery.

6. `src/data/scenes/default/outdoorProfessional/VirtualCinematographer.js`
   - Camera operator plans for reframing, silhouette, eye-line, lead room, headroom, zoom, drift, stabilization, foreground, occlusion, composition repair.

7. `src/data/scenes/default/outdoorProfessional/StoryMemory.js`
   - Previous conversations, weather, lighting, interactions, prop history, emotion history, unresolved tension, future hooks.

8. `src/data/scenes/default/outdoorProfessional/DirectorBrain.js`
   - Per-frame director questions and automatic repairs.

9. `src/data/scenes/default/outdoorProfessional/OutdoorProfessionalScene.js`
   - Compose the full scene, events, shot flow, cameras, props, and continuity.

Files to rewrite:

- `src/data/scenes/default/DefaultLivingScene.js` to export the new scene.
- `src/data/scenes/default/index.js` only if export naming needs extension.
- `tools/verify/defaultDetailedSceneSmoke.js` to verify outdoor default.
- `tools/verify/goalBoardEasySystemSmoke.js` only if default-scene assertion conflicts.
- Maybe `package.json` to add `verify:outdoor-professional`.

Verification target:

Run focused smoke, goal-board smokes if possible, and fast syntax.
