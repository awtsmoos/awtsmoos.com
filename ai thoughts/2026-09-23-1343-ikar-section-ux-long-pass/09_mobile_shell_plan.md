B"H

# Boruch Hashem — Mobile Shell and Presence Plan

Blessed is He.

The Awtsmoos gathers navigation, identity, search, and living presence into one crown; Awtsmoos.com should let that crown guide the page without becoming a second page above it.

## Proven ownership

- `unusualHeader.js` builds the shared `.g-unusual-header` with brand, search, and `.g-header-actions`.
- `UniversalChatLauncher.js` mounts its truthful public online-count button into `.g-header-actions` as `.universal-chat-header-launcher`.
- Header styling is clean and composed through `geelooy/style/geelooy-app/header/index.css`.
- Existing mobile header packing already compresses profile/search/actions below 30rem.
- `launcher.css` gives the universal chat button independent green presence styling.
- Reader `floating-rail.css` and `mobile-main-menu-polish.css` are concurrently dirty and must not be overwritten.

## User-visible problem

The shared mobile crown can still compete with page content because presence, search, profile, menu, and brand all ask for equal visual weight. The supplied screenshots show the presence count as one of the strongest elements even when the user is trying to read or study.

## Implementation boundary

Create one final additive header owner: `mobile-shell-polish.css`.

It will:

1. Refine header glass/depth without changing fixed positioning or safe-area ownership.
2. Standardize tactile easing for header actions.
3. Tighten mobile action gaps while preserving >=44px touch targets.
4. Compact `.universal-chat-header-launcher` at <=42rem into a status orb by visually suppressing its text while leaving the real text in the DOM.
5. Keep a green status dot and offline opacity so presence remains truthful.
6. Avoid changing launcher JavaScript, presence networking, profile logic, search logic, or route dock behavior.
7. Preserve full online-count text on wider layouts.
8. Add explicit reduced-motion shutdown.

## Non-goals

- Do not hide universal chat functionality.
- Do not delete the public online count from DOM/state.
- Do not touch dirty reader floating-control source files.
- Do not move the fixed header or bottom dock into new JavaScript.
- Do not make foreground elements pulse infinitely.

## Verification

- Add final import through clean `header/index.css`.
- Write `mobileShellPolishContract.test.mjs` after the code draft.
- Verify header constructor still owns brand/search/actions.
- Verify launcher still mounts in `.g-header-actions` and still renders the online count.
- Verify <=42rem presence orb, >=44px action targets, focus-visible state, and reduced-motion shutdown.
- Run shared shell/header contracts plus source-quality and Heichelos quality.
- Only after shell is green, consider a separate additive reader-chrome layer through the post reader style spine.
