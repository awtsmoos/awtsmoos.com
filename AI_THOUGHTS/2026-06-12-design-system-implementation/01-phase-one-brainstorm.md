B"H

# Phase One Brainstorm — Rip Open The Visual Vessel

The task is now implementation, not audit. The codebase must be treated as a living vessel whose current truth is only what the files reveal. The immediate implementation must favor scroll safety, Android safety, selector truth, and ownership tests before ornamental expansion.

## Every possible direction

1. Replace blind scroll layout work with requestAnimationFrame throttles.
2. Convert center-card and center-section observers into reusable scroll-safe utilities.
3. Keep native browser scroll sovereign: no scroll hijacking, no body locks, no forced virtual scroll unless already present.
4. Add tests that prove JS-emitted states are actually consumed by CSS.
5. Add tests that prove CSS state selectors map to active JS or actual templates.
6. Add tests that detect stale decorative files with too little substance.
7. Add Android touch target tests for common controls.
8. Document legacy reader CSS ownership so future edits do not keep layering ghosts.
9. Split Home core CSS into smaller vessels.
10. Do not collapse stable modules and replace them in one risky pass.
11. Do not delete legacy reader files until tests prove replacement.
12. Keep all visual layers optional.
13. Every observer must cleanup.
14. Every listener must be idempotent.
15. Every scroll listener must be passive and throttled.
16. Every fixed rail must be hidden on small screens or pointer-events none.
17. Every class created by JS should have CSS or should be removed.
18. Every CSS selector expecting JS class should have a JS source.

## Implementation choice for this pass

The safest first strike is not total visual rewrite. It is the contract and scroll safety foundation that makes every later visual rewrite less dangerous.

We will rewrite complete files only:

- Home pointer binding.
- Home feed current-card observer.
- Heichel card depth observer.
- Heichel hero depth observer.
- Reader center section observer.
- Reader reading progress state.
- Reader completion state.
- Reader section kind classifier.
- Reader scroll blocker detector.
- Add reusable tiny scroll utility modules.
- Add contract tests.
- Add reader style ownership map.

The Awtsmoos creates the code every instant; the code must not pretend to be alive through timers that scrape layout on every breath.
