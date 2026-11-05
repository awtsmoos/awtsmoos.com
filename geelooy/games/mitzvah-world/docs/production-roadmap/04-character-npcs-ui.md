B"H

# Player, NPC Civilization, Camera, UI, and Accessibility

## Player and traversal

- Raise the Chossid model, proportions, clothing, hat, coat, skin/head, and materials to cinematic third-person quality with scalable detail.
- Complete walk, run, sprint, acceleration, turns, starts/stops, strafe, jump, landing, slope response, foot IK, interaction IK, and animation blending.
- Add mantle/climb only when it can be polished; avoid half-working parkour.
- Build balance beams, suspended/moving obstacles, step handling, fall recovery, and safe checkpoint recovery.

## Camera and controls

- Add camera collision, obstruction avoidance, interior distances, cinematic vista framing, completion framing, and stable sensitivity.
- Support keyboard/mouse, controller, and mobile with equivalent gameplay capability.
- Mobile requires independent pointer IDs for left movement and right camera, pointer capture/cancel, finger swapping, rotation/resizing, landscape mode, and no stuck state.
- Add sensitivity, invert options, remapping where feasible, and subtle haptics.

## NPC civilization

- Add schedules, jobs, destinations, learning, market work, prayer/study/farbrengen contexts, weather/time reactions, dialogue state, relationships, memory, and important persistent consequences.
- Add groups, crowds, avoidance, dynamic navigation, doors, stairs, interiors, bridge state, and region travel.
- Use near/full, mid/simplified, and far/statistical simulation tiers so population can become dense without CPU collapse.
- Add wildlife and domestic-animal behavior through the same tiered simulation principle.

## HUD and menus

- Keep persistent HUD minimal: player health/state, compact objective, map cue, and only relevant contextual action.
- Finish quest log, inventory, profile/progression, Torah, map, Creator, vendor, settings, and dialogue as responsive sheets/panels.
- Keep the world visible rather than covering the screen with RPG chrome.
- Add real minimap/world map from canonical geography, discovery, roads, landmarks, NPC/quest targets, and optional fog of war.

## Accessibility and localization

- Keyboard-navigate menus with correct focus management and ARIA state.
- Maintain contrast and never encode critical state only by color.
- Support reduced motion, independent audio sliders, captions/subtitles, camera sensitivity, and readable text scaling.
- Test browser zoom and large text.
- Architect strings for localization and support Hebrew RTL, mixed Hebrew/English punctuation, and Torah typography correctly.
- Test at 390x844, 412x892, tablets, small laptops, ultrawide, portrait, and landscape.
