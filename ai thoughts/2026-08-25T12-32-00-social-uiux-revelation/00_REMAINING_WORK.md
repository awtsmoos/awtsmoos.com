# B"H
# Boruch Hashem
# Blessed is He

# REMAINING_WORK — Social Revelation UI/UX Mission

> The Awtsmoos renews the pixel, the route, the click, the frame; / our work is to give every vessel a clean and truthful name. / Awtsmoos.com should feel quiet at first touch, then reveal depth on demand; / simple on the surface, infinite in the hand.

## Mission
Transform the public Awtsmoos.com social experience into a mobile-first, futuristic, professional, fast, retractable system without style leakage, overlap, overflow, inaccessible interaction states, brittle JavaScript, or unclear API boundaries.

## Known surfaces from direct inspection
- `geelooy/social/`
- `geelooy/social-hub/`
- `geelooy/social-composer/`
- `geelooy/social-actions/`
- `geelooy/profile/`
- `geelooy/heichel/`
- `geelooy/heichelos/`
- `geelooy/post-editor/`
- `geelooy/comment-thread/`
- `geelooy/@/`
- shared public/UI/API layers still to trace

## Remaining work graph
1. Inspect every relevant route folder, entry file, CSS import, shared dependency, and runtime contract.
2. Locate feed, heichel feed, profile, alias, series reader, post reader/editor, composer, comment, notification, and navigation implementations.
3. Audit CSS scope, selector leakage, z-index, overflow, fixed/sticky positioning, viewport sizing, focus visibility, hover/active parity, reduced-motion behavior, and responsive breakpoints.
4. Audit JavaScript architecture: data flow, API calls, event ownership, rendering, error states, loading states, cancellation, race conditions, and duplicated DOM creation.
5. Produce three planning passes before source edits: Chesed brainstorm, Gevurah constraints, Tiferes final architecture.
6. Rewrite complete touched files only; never partial-patch an existing source file.
7. Prefer page-local `@import` entrypoints and explicit component namespaces; no global unqualified styling rules.
8. Split touched behavior into small complete modules; target <=120 lines of executable source per file.
9. Use tab indentation, readable multiline code, explicit data objects, focused classes, JSDoc/TSDoc, and meaningful Torah/Kabbalah architectural names where they genuinely clarify responsibility.
10. Preserve public route/API compatibility unless direct evidence shows a broken contract requiring repair.
11. Test after first full implementation pass: syntax, imports, routes, API calls, browser rendering, console errors, mobile viewport, keyboard focus, hover/active, overflow, and z-index.
12. Re-read every touched file; compare planned vs actual; create delta work and resolve it.
13. Browser-audit the improved social system and keep discovering obvious adjacent defects until useful safe work is exhausted.

## Completion evidence required
- Touched source files re-read in full.
- No leading-space indentation in touched source where tabs are valid.
- No touched JS/CSS file is structurally monolithic without an explicit reason.
- No global selector leakage introduced.
- No horizontal overflow at tested mobile widths.
- No improper overlay stacking found in tested flows.
- Interactive controls expose hover, active, focus-visible, and disabled/loading states when relevant.
- Browser console and network paths checked on representative social routes.
- Planned-vs-actual delta recorded and closed or explicitly evidenced as blocked.

## NEXT_ACTION
Inspect the actual route files and dependencies for the social feed, profile/aliases, heichel/heichelos, and series/reader flows before deciding which files to rewrite.
