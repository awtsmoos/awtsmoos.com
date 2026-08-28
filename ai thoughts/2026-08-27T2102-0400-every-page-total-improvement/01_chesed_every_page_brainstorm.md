# B"H
# Chesed — Every Page, Every Vessel

Boruch Hashem. Blessed is He.

The Awtsmoos renews Awtsmoos.com in every instant; the site should not feel like forty unrelated islands, but one living world whose many pages reveal a coherent language. Chesed therefore explores the widest useful possibility space before any shared foundation is rewritten.

## Observed project reality

- Canonical checkout: `/Users/awtsmoos/work/awtsmoos.com`.
- Current branch: `main`.
- Local HEAD: `ad3203fb5a5121a03f47b680b3fa3aa4f8e5b3af`.
- `origin/main`: `2eed3f7c0cbc537e68187d8d461adb9b09d155c8`.
- Local `main` is behind `origin/main` by five commits.
- Working tree contains hundreds of legitimate modified/untracked files across UI, apps, games, APIs, compact runtime, tests, docs, and generated artifacts.
- Tunnel transport, execution, and mailbox are currently healthy.
- Public top-level route families include home, about, AI, apps, database, comments, contact, control, docs, drive, editor, email, entity viewer, games, heichel tooling, auth, notifications, OCR, OS, portal, profile, recorder, social, social composer, social hub, YouTube, zmanim, and more.
- A shared UI foundation is already emerging under `geelooy/scripts/awtsmoos/ui/`, `geelooy/style/universal-ui*`, and `geelooy/style/geelooy-app/`.
- Dynamic Server has a full `compactJs` graph/compiler/cache/renderer/runtime pipeline plus new compact CSS/static response work.

## Architecture A — Page-by-page beautification

Pros: immediate local improvements.
Cons: duplicates fixes, creates inconsistency, high regression risk, impossible to exhaust literally every route efficiently.

## Architecture B — One giant global stylesheet

Pros: broad reach.
Cons: unacceptable leakage, selector collisions, fragile apps/games, violates localized-style law.

## Architecture C — Universal token/foundation layer only

Pros: safe common colors/type/focus/motion.
Cons: cannot solve route-specific hierarchy, overflow, drawers, toolbars, or complex application shells.

## Architecture D — Shared foundation + route-family adapters

Pros: universal primitives stay small while app/social/game/editor families get explicit scoped adapters. Supports audits and progressive rollout.
Cons: requires careful route inventory and contract tests.

## Architecture E — Shared foundation + adapters + automated audit/runtime quality gate

Pros: best path to literal every-page improvement. The foundation fixes common defects, adapters resolve family-specific UX, and an audit engine discovers remaining overflow/global-style/performance/accessibility defects continuously.
Cons: highest architectural effort, but the work can be split into small truthful modules.

## Preferred architecture

Choose E.

The universal layer should own only tokens, typography baseline, focus semantics, safe motion, foundational form normalization, semantic layers, and generic content constraints. Route adapters should own layout/hierarchy for social, Heichel, apps, games, tools, migration pages, editors, and portal surfaces. An audit engine should enumerate pages, detect known failure signatures, and feed REMAINING_WORK.

## Ideal improvements

1. Shared neutral color/token system with intentional semantic accent/danger/success/warning.
2. Consistent typography scale and readable measure.
3. Minimum touch target policy.
4. Consistent focus-visible contract.
5. Reduced-motion support everywhere.
6. Semantic z-index layer tokens.
7. No broad reusable `button {}` / `input {}` leakage outside foundation scope.
8. Automatic horizontal-overflow audit at target widths.
9. Long-text/URL/error-message stress testing.
10. Consistent drawer/modal focus restoration.
11. Shared loading/error/empty/success state language.
12. Shared compact navigation patterns.
13. Progressive disclosure for advanced tools.
14. Destructive actions visually quiet until intentional invocation.
15. Route-family-specific density policies.
16. App/game shells retain immersive identity while respecting accessibility and containment.
17. Social pages share calm authoring/feed/profile primitives.
18. Migration/admin pages prioritize clarity over decoration.
19. Editors/studios use professional workspace hierarchy rather than stacked chrome.
20. API explorers expose simple mode first, advanced schemas second.
21. Fast-loading route budget measured in requests/bytes/timings.
22. Compact JS/CSS only where runtime contracts prove semantic equivalence.
23. Compression/cache freshness keyed to real dependency changes.
24. Generated bundles regenerated from source, never manually patched.
25. Browser console/network error gate for representative routes.
26. Public release verified against pushed SHA.
