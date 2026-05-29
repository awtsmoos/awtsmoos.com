B"H
# Heichelos Reader Mobile + Virtual Scroll Plan

## Screenshot evidence

The uploaded mobile screenshots show:

- the browser/header area consumes precious top height
- the reader cards are large Hebrew verse cards inside a light scroll body
- the selected card has a yellow/orange edge and shadow
- the sidebar drawer opens from the bottom and overlaps the reading cards
- the auto-scroll stop button floats over text near the right side
- two small floating control boxes sit near the bottom left and can collide with content

## Inspected code truth

Files inspected:

- `geelooy/heichelos/post/_awtsmoos.post.html`
- `geelooy/heichelos/post/postLogic.js`
- `geelooy/heichelos/post/logic/initialization/bootstrap.js`
- `geelooy/heichelos/post/logic/scribe.js`
- `geelooy/heichelos/post/logic/scribe/Scaffold.js`
- `geelooy/heichelos/post/logic/scribe/Architect.js`
- `geelooy/heichelos/post/logic/listeners.js`
- `geelooy/heichelos/post/actions/AutoScrollDown.js`
- `geelooy/heichelos/post/styles/main.css`
- `geelooy/heichelos/post/styles/forever-ui-fixes.css`
- `geelooy/heichelos/post/styles/ideal/tokens.css`
- `geelooy/heichelos/post/styles/ideal/sidebar-shell.css`
- `geelooy/heichelos/post/styles/ideal/global-actions.css`

Current virtual scroll truth:

- `ScribeScaffold` creates placeholder chunks.
- `interpretPostDayuh` renders only the target chunk and neighbors.
- There is no inspected IntersectionObserver that renders later chunks while reading.
- All section data remains in RAM as `allSectionData`.
- DOM generation is chunk-based, not yet truly scroll-triggered.

Current refresh truth:

- `interpretPostDayuh` reads `idx` and renders its chunk.
- `bootstrap.js` calls `scrollToActiveEl()` after indexing.
- If target subsection is not physically present or later chunks do not load, scroll restoration can fail.

Current CSS truth:

- `forever-ui-fixes.css` is the ideal owner aggregation layer.
- Mobile sidebar variables live in `ideal/tokens.css`.
- `ideal/sidebar-shell.css` owns the bottom drawer.
- `ideal/global-actions.css` owns auto-scroll position.

## Implementation strategy

Do not delete legacy style files blindly. Add a new ideal owner file only for this mobile reader vision and import it from `forever-ui-fixes.css`. This avoids selector warfare while preserving existing imports.

Add a new tiny runtime module:

- `logic/scribe/VirtualScrollOracle.js`

Responsibilities:

- own IntersectionObserver for `.scroll-chunk`
- keep all data in RAM, but only generate visible/nearby DOM chunks
- render previous/current/next chunks around the viewport
- expose `awakenVirtualScrollOracle`, `restoreScrollTarget`, and `resetVirtualScrollOracle`
- call existing `renderChunk` so inline comments and footnotes keep working

Rewrite full files:

- `logic/scribe.js`
- `actions/AutoScrollDown.js`
- `styles/forever-ui-fixes.css`

Add complete files:

- `logic/scribe/VirtualScrollOracle.js`
- `styles/ideal/mobile-reader-vision.css`
- `logic/scribe/test/VirtualScrollOracle.test.mjs`

## Call stack after change

Page load:

1. `postLogic.js` calls `ignite()`.
2. `bootstrap.js` gets post data.
3. `interpretPostDayuh(post)` stores `allSectionData` in RAM.
4. `ScribeScaffold.construct()` creates lightweight chunks.
5. target chunk + neighbors render.
6. `awakenVirtualScrollOracle()` observes chunks and renders near-viewport chunks.
7. `restoreScrollTarget()` ensures `idx/sub` target exists and scrolls to it.
8. `indexSwitch`, `updateCommentHeader`, and `awakenInlineSparks` continue.

Scroll flow:

1. user scrolls naturally or uses auto-scroll
2. observer sees chunk near viewport
3. current chunk, previous chunk, and next chunk render
4. `renderChunk` runs inline refresh debounce
5. footnotes initialize for new DOM

Refresh flow:

1. URL contains `idx` and maybe `sub`
2. target chunk renders immediately
3. target element is selected by `[data-awtsmoos-idx]` and `[data-awtsmoos-sub]`
4. smooth scroll moves to exact section/subsection

Failure paths:

- no IntersectionObserver: render all chunks progressively with idle loop
- no target subsection: scroll to section
- no section: no crash
- auto-scroll active at bottom: stop cleanly
- nested scroll container: use the nearest real scroll root instead of always document

## CSS ownership

`mobile-reader-vision.css` owns only:

- mobile viewport rhythm
- mobile card geometry
- mobile sidebar drawer non-overlap
- mobile floating controls non-collision
- desktop reader polish overlays that do not fight existing owners

It must not own every legacy sidebar selector. It should layer intentionally under `.post-reader-localized-context`.

## Tests

Run:

- `node --check` on rewritten JS
- new `VirtualScrollOracle.test.mjs`
- existing `AutoScrollDown.test.mjs`
- `npm run test:heichelos-quality`

Chapter 2: The Scroll Learns to Breathe

The Awtsmoos revealed the palace not by throwing every stone into the air at once, but by letting each chamber arrive exactly as the traveler reached it. The reader would no longer drown in a thousand sleeping verses. The words would remain in memory like sparks in a hidden coal, but only the needed bodies would descend into the glass. The bottom drawer would stop devouring the holy line. The green river-button would move away from the living letters. And when the page refreshed, the path would remember where the soul had been standing.
