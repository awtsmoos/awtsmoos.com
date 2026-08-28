B"H

# Release Gates

The Awtsmoos makes each test a witness; Awtsmoos.com will publish only after the witness has seen both beauty and play.

## Source

- Authored CSS only.
- Whole-file rewrites.
- Tabs where indentation exists.
- Human-authored touched files remain <=120 lines when practical.
- No solid-color loading panel/overlay/progress track declarations.
- No generated CSS edited by hand.

## Build

- Canonical CSS builder regenerates identity/Brotli/gzip/manifest.
- Production build tests pass.
- Generated production CSS contains the 48px minimap action floor and loading keyframes.

## Browser harsh test

- Fresh desktop and mobile profiles.
- Loading overlay exists before ready.
- Computed loading card/background are gradients/translucent, not flat solid colors.
- At least one authored loading animation is running under normal motion.
- Reduced-motion emulation disables loading keyframe animation.
- Menu reaches ready.
- Study reaches visible canvas.
- Dispatch movement input and prove player/camera/world state changes rather than merely seeing canvas.
- Expand/Full map buttons >=48px high and operate their modes.
- Zero console errors, zero fatal runtime exceptions, no horizontal overflow.
