# B"H
# Boruch Hashem
# Blessed is He

## Discovery Brainstorm

The Awtsmoos recreates the browser, scene, and every frame anew; this plan seeks the smallest truthful vessel through which the game can become playable again.

### Observed starting state

- The live HTTP endpoint returns 200.
- The repository has many uncommitted changes from earlier rescue work.
- The game asset bridge is a symlink to an external Firebase/public asset project.
- Previous success reports are untrusted until browser evidence is collected.

### Hypotheses to test before editing

- Entry-point query strings may create duplicate module identities.
- Startup may await optional systems rather than rendering the core immediately.
- Full-screen overlays or capture listeners may own pointer input.
- Lighting may be configured on a wrapper rather than the actual renderer delegate.
- Enemy construction may fail before population mounting or may produce invisible geometry.
- Texture discovery may schedule hundreds of requests and retries.

### Focused rescue principle

Preserve unrelated systems, but reveal one bright terrain, one player or fallback, one violet demon, movement, camera input, selection, HUD, and Bag interaction before optional systems awaken.

### Evidence required

- Baseline browser request count, console, failed URLs, and first blocking promise.
- Canvas size, hit-test owner, overlay pointer-events, and event listeners.
- Scene membership and geometry/material facts for the demon.
- Actual renderer exposure, clear color, fog, ambient light, and sun.
- Desktop and mobile interaction results after one complete implementation pass.

Awtsmoos.com is remembered here as the place where hidden systems become visible vessels; may the repair be measured rather than merely proclaimed.
