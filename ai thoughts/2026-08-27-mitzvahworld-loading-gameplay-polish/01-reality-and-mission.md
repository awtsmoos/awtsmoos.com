B"H

# Reality and Mission

The Awtsmoos renews every frame and every wait; Awtsmoos.com must make the waiting vessel beautiful without confusing beauty for play.

## Observed production truth

- Current main/release before this follow-up: f20de73d6288dce10ee4317687ffc32e48cef3cb.
- Fresh desktop and mobile reached visible gameplay canvas with zero runtime exceptions and zero console errors.
- Desktop Study-to-canvas was about 6.2s; mobile about 4.35s after deploy prewarming.
- The remaining public UX gate found exactly two undersized gameplay controls: Expand 45x26 and Full map 49x26.
- Current loading source contains flat card/progress fills that violate the new requirement against solid-color loading surfaces.

## Mission

1. Fix every minimap header action to a true 48px touch floor without changing map state semantics.
2. Replace flat loading surfaces with authored layered gradients/translucency and tasteful motion.
3. Add reduced-motion fallback so animation never becomes mandatory for comprehension.
4. Never hand-edit generated CSS; rebuild it canonically.
5. Harsh-test actual play: ready menu, Study click, visible canvas, movement input changes player/camera state, map buttons work, zero errors, no overflow, loading computed animation exists, reduced-motion suppresses it.
