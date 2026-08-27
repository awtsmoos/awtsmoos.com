B"H
Boruch Hashem
Blessed is He

# Post-Write Readback and Second-Pass Plan

The Awtsmoos renews every instant, and so Awtsmoos.com must be judged by what was actually written, not by what the plan imagined.

## Original plan remembered

- Restore the historical scroll-discovery spine without discarding today’s useful social and launcher work.
- Restore popular search paths, four primary product shortcuts, the status rail, and eight direct navigation doors.
- Reconnect the deleted CSS modules.
- Give each restored section the existing IntersectionObserver reveal behavior.
- Keep motion restrained and reduced-motion safe.
- Keep the hero image external to Git and recover a genuine larger source only if evidence supports it.
- Add regression coverage for fold order, responsive ribbon behavior, bundle wiring, and external image storage.
- Preserve unrelated dirty work.

## What the first write pass actually produced

- `geelooy/index.html`: restored all four missing navigation layers while preserving social hero actions, launcher, profile mount, featured worlds, and mobile dock.
- `hero-layout.css`: restored explicit fold ordering and popular-search chip layout.
- `components.css`: restored imports for shortcuts, status, direct navigation, and fresh reveal CSS.
- `reveal-motion.css`: added soft blur-to-sharp scroll reveal and preserved pointer lighting with reduced-motion parity.
- `homeFoldContract.test.mjs`: updated source contracts around the restored grid and alias-backed hero.

## Readback delta

The browser-facing structure is correct, but `index.html` is only 93 lines because several navigation groups are cramped onto oversized lines. That is not acceptable source hygiene under this project’s modular readability rules even though it is valid HTML.

The second pass therefore rewrites the complete HTML again, expanding the densest navigation and action groups while staying beneath the 120-line file ceiling. No behavior should change in this formatting pass.

## Second-pass exact work

1. Rewrite the entire `geelooy/index.html`.
2. Split hero actions onto readable lines.
3. Split all eight direct-navigation anchors onto individual lines.
4. Split the mobile dock anchors onto individual lines.
5. Split footer links where useful.
6. Keep the external hero URL unchanged.
7. Keep the page at or below 120 lines.
8. Re-read the rewritten HTML.
9. Then begin tests and browser verification.

## Remaining image truth

- Current external alias hero: 1024×1024, about 220 KB.
- Recoverable historical Git hero: only 480×270, so it is rejected as a downgrade.
- No genuine larger historical source has yet been proven.
- Never upscale and call it original; never put the binary back in Git.
