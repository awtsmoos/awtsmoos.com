B"H

# Hod Upgrade: Realism + Performance Without Stopping Early

## Goal

Make Ohr HaGnuz feel much closer to the earlier gameplay pictures while getting faster, not heavier.

## Main problems from inspection

1. Player and NPCs are procedural body parts every frame, which is flexible but not sprite-sheet-like enough.
2. World redraws every visible tile every frame, including static ground and objects.
3. Idle motion is not fed with real time, so the hero is too still when not moving.
4. Battle combatants only bob; no attack/recoil/cast feeling.
5. World detail is decent but not layered enough: no foreground canopy, no cached decorative texture layer, and too many tiny primitives repeated every frame.

## Upgrade path

1. Add a performance static-map cache:
   - cache ground/object/decor by map and viewport-size-independent world canvas
   - redraw cache when map changes or tile data changes
   - Projector draws crop from cached world canvas each frame, then dynamic actors/HUD/ambience

2. Add sprite-style player renderer:
   - generate a pixel-art frame in canvas primitives
   - frame states for idle, walk, talk/cast-like pulse
   - use direction and movement progress
   - keep tiny files

3. Add NPC animation polish:
   - reuse humanoid renderer with staggered idle phase
   - no static glyph-only awkwardness

4. Add battle animation:
   - player/enemy recoil/cast based on State.BattleFx and time
   - silhouettes feel alive without expensive rendering

5. Verify:
   - import graph
   - cache invalidation smoke
   - canvas draw smoke
   - motion animation values smoke
   - grep for old stepTick/frame conflicts

## Chapter 1: Hod Refused the Heavy Crown

Hod saw the village glittering, but too much of the glitter was being repainted as if creation had forgotten what could rest. The Awtsmoos has no body and no form; He renews all things every instant, yet code must not pretend that every brick needs to be redrawn by hand every breath. So Hod taught the world humility: cache the stone, animate the living, let trees stand while people move, and make beauty faster by giving stillness a vessel.
