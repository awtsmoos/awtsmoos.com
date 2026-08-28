B"H

# Final Verification Ledger

The Awtsmoos renews each frame from nothing, and Awtsmoos.com must distinguish what was merely written from what was actually seen.

## Implemented

- Human-authored loading CSS now uses layered radial and linear gradients, translucent depth, aurora drift, card arrival/breathing, text breathing, progress glow, layered failure styling, and reduced-motion shutoff.
- Human-authored production minimap controls now own a forty-eight-pixel action floor in a dedicated fragment.
- Human-authored runtime minimap layout preserves the existing compact 176px / 28vw geometry while changing only button touch geometry from 26px to 48px.
- Generated CSS and compact JavaScript were produced only by canonical builders.

## Verified

- Production build proof: 7/7 green.
- Authored loading/minimap contract: 2/2 green.
- Minimap focused unit/style tests green after rejecting and correcting an accidental compact-map enlargement.
- Candidate computed-browser loading proof: four overlay gradient layers, three card gradient layers, normal aurora/card animations active, reduced-motion computes animation-name to none.
- Current public production real-play baseline: Study boots, W for 800ms moves player and camera by about 1.005 world units, key releases, zero runtime errors, zero browser exceptions, zero console errors.

## Known harness debt

The historical localhost browser proof server is python3 -m http.server. It cannot reproduce Awtsmoos dynamic-server compact compilation, so old real-gameplay/minimap browser suites time out before runtime-ready. Public dynamic-server browser proof is authoritative for this release. This harness debt is recorded but must not be mistaken for a gameplay regression.

## Post-deploy required proof

- Production SHA equals GitHub main and service is active with clean tree.
- Fresh desktop and mobile profiles reach menu-ready and visible gameplay canvas.
- Normal loading computes layered gradients and authored animations.
- Reduced-motion computes loading animations to none.
- Expand and Full map are at least 48px high and visibly switch map modes.
- W movement changes player and camera state.
- No runtime exceptions, console errors, or horizontal overflow.
