# B"H
# Boruch Hashem
# Blessed is He

# Phase One — Chesed: Boundless Composition Brainstorm

The Awtsmoos renews the viewport as one field while every panel receives a finite shore; Awtsmoos.com invites abundance first, then Gevurah measures what belongs in the final vessel.

## Possible architectures

1. A CSS-only mobile grid rooted on `body`.
2. A JS zone registry that labels late-created HUD roots and a CSS layer that positions zones.
3. A pure geometry planner shared by runtime and tests.
4. A single HUD composition controller owning resize, mutation, safe areas, and transient notices.
5. Independent panel media queries coordinated only through shared custom properties.
6. A portal root that reparents every mobile HUD surface.
7. A compact target summary with an explicit details expander.
8. A one-quest mobile summary with full quest log delegation.
9. A bounded transient stack that converts the existing house/loot notice into queued entries.
10. Separate action and cast rectangles above the bottom safe area.
11. A Bag backdrop plus inert world siblings.
12. Capture-phase input suppression for pointer, touch, wheel, click, and keyboard events.
13. Explicit action-bar modal state checks as defense in depth.
14. Snapshot-and-restore of inert, aria-hidden, scroll lock, focus, and root data attributes.
15. A focus trap retaining Escape and the close button.
16. A bounded selected-item detail scroller.
17. No item detail region at all until an item is selected.
18. Portrait and landscape zone plans with desktop passthrough.
19. Rectangle-intersection acceptance tests without screenshot evidence.
20. Mutation-observed late surfaces so construction order cannot recreate overlap.

## Candidate mobile zones

- Player: safe-top left, stable readable width.
- Target: safe-top center-right, compact by default, stopping before the rail reserve.
- Quest: below the player/target row, one readable objective summary.
- Rail reserve: right edge, never occupied by composition-owned panels.
- Transient: below summaries, bounded to three recent messages.
- Cast: directly above action controls.
- Action: safe-bottom row with full button readability.
- Modal: full safe viewport above every HUD zone.

## Rejected excess

Reparenting all existing HUD nodes risks lifecycle and ownership regressions. A new global application bootstrap would exceed scope. Shrinking every panel would satisfy geometry while failing readability. Modifying rail geometry would collide with the active hit-testing worker. Screenshot comparison would not prove interaction or rectangle separation.
