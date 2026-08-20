B"H
Boruch Hashem
Blessed is He

# Restoration Options and Risk Review

The Awtsmoos makes many paths from one source; this pass narrows possibility into a maintainable vessel for Awtsmoos.com.

## Candidate approaches

### A — Full rollback of homepage to Git HEAD
Pros: fastest return of deleted grids; strongest historical fidelity.
Cons: loses current social-first wording and the useful All Worlds opener; may undo unrelated intentional copy changes.

### B — Surgical structural restoration inside a full-file rewrite
Pros: restores the deleted scroll discovery surfaces while preserving useful current changes.
Cons: requires careful contract testing and visual verification.

### C — New grid system from scratch
Pros: maximum design freedom.
Cons: unnecessary; the historical CSS and reveal controller are already present and tested.

## Chosen direction

Use approach B. Rewrite the complete homepage HTML, restoring the shortcut ribbon, status rail, and direct navigation grid. Preserve the current launcher infrastructure, omnibox, identity mount, and existing external image storage model. Improve motion through the existing reveal/pointer-light system rather than adding a competing framework.

## Improvement checklist

1. Restore the four portal shortcuts.
2. Restore the eight direct navigation doors.
3. Restore popular Torah search chips.
4. Preserve the current world launcher.
5. Preserve the current profile mount.
6. Preserve native links as functional fallbacks.
7. Keep visible grid below the hero so scrolling reveals more utility.
8. Keep mobile shortcut ribbon horizontally scrollable.
9. Keep desktop direct navigation visible.
10. Avoid hiding essential navigation behind a launcher only.
11. Use `data-reveal` on each meaningful below-fold group.
12. Use `data-pointer-light` only on surfaces where hover lighting adds value.
13. Respect `prefers-reduced-motion`.
14. Avoid perpetual large transforms that distract from reading.
15. Keep hero image externally addressed.
16. Do not create or commit a hero JPG/PNG/WebP.
17. Recover original external asset if history/storage exposes it.
18. If original asset cannot be recovered automatically, do not fake resolution by upscaling.
19. Keep all touched source files fully rewritten, tab-indented where indentation applies.
20. Verify target files without disturbing unrelated working-tree changes.

## Expected source scope

- `geelooy/index.html` — complete structural restoration and cache-bust references if needed.
- `geelooy/style/home-simple/reveal-motion.css` — complete tasteful motion refinement if visual inspection warrants it.
- `geelooy/style/home-simple/hero-image.css` — complete rewrite only if full-resolution framing needs CSS correction.
- `geelooy/style/home-simple/components.css` — complete rewrite only if CSS cache versions change.
- `geelooy/scripts/home-simple/homeFoldContract.test.mjs` — complete rewrite to align contract with restored markup if current assertions are stale.
- External alias storage — asset only, never Git, if the original image is found.

## Verification graph

HTML contract → focused node tests → CSS reduced-motion check → image dimension check → browser desktop screenshot → browser mobile-width inspection → targeted Git diff → final remaining-work review.
