B"H

# Whole-file writes

Added performance.js. Rewrote state, settings, culling, terrain, objects, particles, portal, renderList/index, render/frame, renderer, and cache-busted index. The governor watches dt and command count, scales render caps/distance, disables optional shadows/rings/particle trails/map density/PostFX under stress, and exposes fps/scale on world.performance.
