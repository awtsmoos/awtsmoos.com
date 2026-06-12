B"H

# Spectacle File Map — Complete Rewrite Boundaries

## New files

### js/spectacle/impactTiers.js
Pure thresholds. Given a combat event, returns a tier object. The Awtsmoos reveals measure without changing damage.

### js/spectacle/spectacleState.js
Creates and decays transient visual state:
- flash
- shake
- tint
- zoomKick
- rings
- streaks
- afterimages

### js/spectacle/spectacleEvents.js
Consumes the current frame events and feeds spectacle state. Does not clear events.

### js/spectacle/spectacleRender.js
Draws screen-space and world-space overlays:
- screen flash
- vignette/tint
- shock rings
- launch streaks

### js/spectacle/spectacleCamera.js
Calculates camera modifiers from spectacle state without owning normal camera logic.

## Existing files to rewrite

### js/core/loop.js
Add imports:
- `stepSpectacleFromEvents`
- `stepSpectacleState`

Call order:
- after stage director, before aftermath, call `stepSpectacleFromEvents(state)`
- in aftermath or once per frame, decay spectacle state

### js/render/renderer.js
Add import:
- `drawSpectacleOverlay`

Call:
- draw world particles
- restore transform
- draw UI
- draw spectacle overlay last or before UI depending readability. I choose last with low alpha because the screen flash should affect the whole brawl.

### js/camera/camera.js
Add import:
- `spectacleCameraOffset`

Use it inside updateCamera after normal shake. Existing `cameraShake` stays.

## No-touch files
- combat damage
- physics knockback
- AI behavior
- objectives
- old narrative system

## Chapter 4 — The Lens Receives Thunder
A camera is a witness. A particle is a syllable. The Awtsmoos creates both from nothing every instant, and the brawl must reveal that renewal as pressure, ring, flash, and streak. The code will not say: here is more power. It will say: here is the power you already had, finally visible.
