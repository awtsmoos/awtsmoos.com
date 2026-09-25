B"H

# Boruch Hashem — Ikar Persistent Geometry Delta

Blessed is He.

The Awtsmoos renews the first paint and the enhanced state as one continuous scene;
Awtsmoos.com now keeps the learner's visible controls alive instead of swapping what they mean.

## Planned

- Preserve stable first-paint geometry.
- Remove the disabled decoy search state.
- Reuse the server navigation/search during enhancement.
- Prevent duplicate controls and removal-based layout transitions.
- Keep every touched module within the focused-file boundary.

## Actual

- Rewrote `semantic/fallback.html` so Ikar search is enabled at first paint.
- Rewrote `ikar-stable.js` into a pure enhancer bridge with no DOM removal pass.
- Rewrote `ikar-first.js` to reuse stable navigation and orchestrate discovery.
- Split search behavior into `ikar-search.js` when the first orchestrator draft measured 121 lines.
- Rewrote both Ikar geometry/layout contract tests around persistent controls.

## Evidence

- Persistent geometry contract: PASS.
- Ikar layout stability: 4/4 passing.
- `ikar-first.js`, `ikar-search.js`, and `ikar-stable.js`: syntax checks passing.
- Human-authored touched files in this pass: all under 120 lines.
- Local `/heichelos/ikar/`: HTTP 200.
- Local server output contains stable navigation.
- Search is no longer emitted disabled.
- Heichelos quality gate passes across 1,410 scanned files.

## Important observed runtime detail

The current local Ikar root contains only three top-level Torah pathways, so the root correctly omits section search because the search threshold is eight links. Nested Ikar routes with larger section lists still receive the immediately usable stable search field.

## Remaining work

- Browser-level mobile proof remains required for the final product gate.
- Section-card presentation still needs visual density review, but its links are already real anchors.
- Phase B now has the strongest gravity: unify selected-text Translate / Tanach / Related into one readable Study Sheet and remove the low-contrast stacked-panel experience shown in the supplied screenshots.
