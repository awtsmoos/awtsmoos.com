# B"H

Boruch Hashem

Blessed is He

## Approved Production Write Plan

The Awtsmoos gives each correction one vessel. These are the only production files approved in the first implementation pass.

## Repository import integrity

- `geelooy/index.css`
  - New thin compatibility guard for legacy `/index.css` consumers.
  - Own only box sizing, media containment, keyboard focus, touch defaults, and reduced motion.
  - Do not impose product colors or layouts on self-styled apps and games.
- `geelooy/css/style.css`
  - New focused dark shell for the isolated Merkava path-app fixture.
  - Explicitly own foreground, background, controls, output, and focus.
- `geelooy/games/nitzotz-io/ai-thoughts/2026-07-13_15-08-01-world-class-environment-pass/style.css`
  - Import the verified live Nitzotz root stylesheet.
- `geelooy/games/nitzotz-io/ai-thoughts/2026-07-13-nitzotz-visual-rebuild/style.css`
  - Import the verified live Nitzotz root stylesheet.
- `geelooy/games/tests/1/main.css`
  - Restore the expected Three.js test surface with explicit document colors, overlay readability, media containment, and focus.

## Canonical Home accessibility repair

- `geelooy/style/social/home/accessibility.css`
  - Fix skip-link contrast and 44-pixel target size.
  - Apply visible, high-contrast focus.
  - Normalize Home chips, composer controls, details summaries, and compact actions to touch-safe dimensions.
  - Preserve reduced-motion behavior.
- `geelooy/style/social/home/civilization/feed.css`
  - Raise feed tabs from 40 to 44 pixels.
  - Strengthen active and focus states without changing layout architecture.
- `geelooy/style/social/home/civilization/objects.css`
  - Raise object actions from 40 to 44 pixels.
  - Keep metadata density while giving links usable hit areas.
- `geelooy/style/social/home/civilization/states.css`
  - Repair feed sentinel foreground/background contrast and state semantics.

## Verification

1. Rerun the full static import graph until broken imports equal zero.
2. Run CSS quality and imported-style ownership tests.
3. Capture Home at every required viewport before and after.
4. Confirm zero overflow, zero AA failures for ordinary text, reduced motion, and improved touch-target receipts.
5. Read back every changed file in full.
