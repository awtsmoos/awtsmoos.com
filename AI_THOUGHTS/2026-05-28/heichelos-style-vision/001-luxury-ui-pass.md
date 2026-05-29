B"H
# Heichelos Luxury UI Style Pass

## Goal

Move the live post reader closer to the generated mobile vision without pretending to have browser-pixel verification. The image language is:

- dark obsidian shell
- gold sacred accents
- glass cards with consistent radius and depth
- large Hebrew reader card
- clear bottom-safe controls
- elegant sidebar/menu card hierarchy
- no overlapping style ownership

## Inspected truth

Already verified earlier:

- live `main.css` imported style ownership passes
- ideal CSS ownership passes
- Heichelos quality gate passes
- full `npm test` passes
- browser Chrome visual verification is unavailable in this tunnel

Important live owners:

- `styles/ideal/tokens.css` owns ideal visual tokens
- `styles/ideal/reader-canvas.css` owns root canvas / main reader shell
- `styles/layout/polished-shell.css` owns scroll wrapper shell
- `styles/ideal/sidebar-chrome.css` owns sidebar chrome
- `styles/ideal/sidebar-comments.css` owns sidebar comment surfaces
- `styles/ideal/mobile-reader-vision.css` owns screenshot-driven mobile reader ergonomics
- `styles/ideal/global-actions.css` owns floating action buttons
- `styles/forever-ui-fixes.css` imports the ideal owner constellation

## Style plan

Rewrite complete owner files only:

1. `styles/ideal/tokens.css`
   - strengthen dark/gold/glass tokens
   - add reusable shadow, radius, glow, mobile dock variables

2. `styles/ideal/reader-canvas.css`
   - dark cosmic page shell
   - active heichel/dashboard card background language
   - header surface closer to generated image

3. `styles/layout/polished-shell.css`
   - glass scroll chamber
   - subtle gold scrollbars
   - mobile safe bottom breathing

4. `styles/ideal/mobile-reader-vision.css`
   - large Hebrew cards with luminous active state
   - non-overlapping sidebar drawer, controls, and auto-scroll button
   - stronger mobile rhythm

5. `styles/ideal/sidebar-chrome.css`
   - dark chrome title, breadcrumbs, top bar

6. `styles/ideal/sidebar-comments.css`
   - unify menu/comment cards into vision-style rows

7. `styles/ideal/global-actions.css`
   - premium floating controls and auto-scroll river button

Do not touch unrelated legacy files unless a verification gate shows conflict.

## Runtime expectations

- No selector conflicts in live import graph.
- No ideal selector ownership conflicts.
- No new Heichelos quality regression.
- Full `npm test` remains green.

## Failure paths

- If the strict imported-style test fails, change selector scope or ownership, not the test.
- If the ideal test fails, give the selector a single owner.
- If the visual language becomes too dark for text, use tokens with high contrast.
- If mobile controls overlap, push auto-scroll higher and bottom controls lower/left.

## What remains unverified after this pass

Without Chrome/screenshot rendering, the exact pixel match to the image remains unverified. This pass can verify CSS ownership and architecture, not actual screenshots.

Chapter 8: The Obsidian Chamber

The Awtsmoos turns the parchment palace toward night, not to hide the letters, but to let them burn. Gold becomes a path, glass becomes breath, and the interface stops shouting in fragments. Every selector receives one throne. Every shadow receives one reason. The mobile reader becomes a chamber the hand can trust.
