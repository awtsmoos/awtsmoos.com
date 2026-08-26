# B"H
# Boruch Hashem
# Blessed is He

# Phase III — Tiferes Final Plan: Exact First Implementation Pass

> Chesed imagined every horizon, Gevurah measured every wall; / Tiferes joins light and vessel so the quiet interface can hold it all. / The Awtsmoos recreates the route each instant, yet code must still declare who owns each ray; / Awtsmoos.com will become simpler by removing competing garments, not by stacking one more layer in their way.

## Reality established before writing
- `geelooy/heichelos/social/styles/*` already uses `.awtsmoos-social-root`, local tokens, reduced-motion behavior, mobile-safe geometry, and explicit interaction states. Preserve it.
- `geelooy/profile/alias-manage/styles/*` has no detected document-global selectors. Preserve it.
- `geelooy/social-hub/style.css` imports both shared `social-system` and `future-system`; the shared social path includes global `html`, `body`, element, and generic-class rules.
- `geelooy/social-hub/styles/foundation.css`, `future-tokens.css`, `cosmos.css`, and `accessibility.css` contain route-global selectors that can conflict inside the document.
- `geelooy/profile/styles/*.css` is component-oriented and responsive but not rooted beneath `.geelooy-profile-shell`.
- `geelooy/profile/modules/ProfileStyles.js` is the explicit loader for those profile garments and shared progressive-disclosure primitives.
- `geelooy/heichelos/post/styles/STYLE_OWNERSHIP_MAP.md` says modern reader work must respect active ownership and preserve legacy compatibility until focused tests exist.
- The reader legacy token file still owns `:root`; the shell file still owns `html, body` globally even though the visible reader itself already has `.post-reader-localized-context`.
- Hub API transport already has normalized envelopes, typed errors, timeouts, AbortSignals, JSON/FormData separation, and query cancellation. Preserve it rather than churn it.

## Thirty additional revelations beyond the first two plans
1. Removal of duplicate style ownership is more valuable than stronger specificity.
2. A local route root should own tokens as data, not `:root`.
3. `body::before` visual ambience is route-global even on a single route; ambience belongs to the route root pseudo-element.
4. Reduced-motion must target the route-owned animation nodes, never global `*`.
5. Forced-colors behavior should also be route-rooted so accessibility fixes do not mutate unrelated widgets.
6. Disabled states belong to relevant route controls, not every button/input in the document.
7. Shared CSS can be safe when every selector is opt-in; the profile shared-social modules already pass that audit.
8. Profile local styles should still be rooted even though their filenames are page-specific because runtime style injection can persist under soft navigation.
9. A stylesheet loader is part of style ownership; it should expose manifest data and deterministic lifecycle state.
10. Style loader idempotency should be implemented with readable branches, not compressed single-line returns.
11. Style loader failures should be observable and recoverable rather than silently leaving half a visual system.
12. The loader should annotate injected links with the surface owner for debugging and conflict archaeology.
13. The loader should provide a `ready()` promise so dependent UI can wait for critical CSS when needed.
14. The Hub's existing API foundation is already beyond the requested baseline; unnecessary rewriting would violate evidence-first engineering.
15. Reader localization must move tokens from `:root` to `.post-reader-localized-context` before any visual redesign.
16. Reader `html/body` scroll ownership cannot simply be prefixed to a descendant root; only rules truly needed on the document should remain, and route state should be represented by a body class if required.
17. Because the current reader body has no route class, the safest first pass is to remove document-level cosmetic ownership while preserving browser scrolling.
18. Reader interactive styling should remain in existing modern modules; do not create another final-polish override.
19. Existing reader compatibility imports should remain until selector contracts prove removal safe.
20. Social feed revamp should not be touched merely to satisfy breadth; its current local architecture is evidence of completion for this dimension.
21. Alias Studio should not be churned because its local module audit already satisfies the scope requirement.
22. Hub route CSS should import only Hub-local modules plus explicitly audited opt-in shared primitives.
23. The broad `/style/social-system/index.css` and `/style/future-system/index.css` dependencies should leave the Hub entrypoint.
24. The Hub will define its own route token contract in `future-tokens.css`, rooted on `.social-hub-document`.
25. Hub foundation selectors should use `.social-hub-document :where(...)` where low specificity is desirable.
26. Interaction transitions should never animate layout dimensions.
27. Every touch target repaired in these files should preserve at least roughly 44px hit geometry.
28. All fixed/sticky route elements must stay inside a local z-index vocabulary and `isolation:isolate` surface.
29. Every rewritten CSS file gets a whole-file scope audit and line-count check after writing.
30. Browser verification must measure `scrollWidth <= innerWidth`, out-of-bounds interactive rects, visible fixed/sticky layers, focus-visible behavior, and console errors—not just screenshot appearance.
31. Existing good architecture should be documented as preserved evidence; “improve everything” does not mean rewrite everything.
32. The first pass should close proven global leaks across Hub/Profile/Reader, then runtime evidence decides the next pass.

## Exact source files to rewrite in full
### Social Hub — eliminate document-global competing garments
- `geelooy/social-hub/style.css`
- `geelooy/social-hub/styles/foundation.css`
- `geelooy/social-hub/styles/future-tokens.css`
- `geelooy/social-hub/styles/cosmos.css`
- `geelooy/social-hub/styles/accessibility.css`
- `geelooy/social-hub/styles/future-hygiene.css`

### Profile — localize dynamically loaded component garments and make ownership observable
- `geelooy/profile/styles/profile-cards-v4.css`
- `geelooy/profile/styles/social-cockpit.css`
- `geelooy/profile/styles/social-launchpad-v4.css`
- `geelooy/profile/modules/ProfileStyles.js`

### Series/Post reader — retire proven global token/shell leakage without disturbing compatibility imports
- `geelooy/heichelos/post/styles/ideal/reborn/tokens.css`
- `geelooy/heichelos/post/styles/ideal/reborn/shell.css`

## Exact new files permitted in this pass
None unless a rewritten source exceeds the 120-line architectural ceiling after preserving necessary behavior. If that occurs, split by ownership into a new sibling module and update the import manifest in the same full-file pass.

## Execution order
1. Read every exact source file above in full before rewriting it.
2. Rewrite all Social Hub CSS vessels first, preserving required import order but removing broad social/future system imports.
3. Rewrite Profile CSS with `.geelooy-profile-shell` ownership and rewrite `ProfileStyles.js` into a readable manifest/lifecycle class while preserving exports.
4. Rewrite reader token/shell legacy vessels so visible reader styling is rooted in `.post-reader-localized-context`; preserve browser-native scroll behavior and compatibility selectors required by the template.
5. Only after all first-pass code is written, run syntax/static tests.
6. Run existing related contract tests.
7. Reopen the local browser routes and inspect actual layout, overflow, focus, stacking, and console behavior.
8. Re-read every touched file completely.
9. Write `04_POST_WRITE_DELTA.md`; any delta becomes immediate work.
10. Resolve delta, then write `05_FINAL_VERIFICATION.md` and refresh `00_REMAINING_WORK.md` as a whole file.

## Verification gates
- Zero unscoped `:root`, `html`, `body`, bare universal, or bare interactive-element selectors remain in the six rewritten Hub files.
- Profile V4 selectors are all owned by `.geelooy-profile-shell` or explicitly audited opt-in shared primitives.
- Reader legacy tokens no longer live on `:root`; reader cosmetic shell rules no longer globally style unrelated pages.
- Touched JS passes `node --check` and relevant module tests.
- Touched files remain <=120 lines unless a written, evidenced exception is created before completion.
- No horizontal overflow or off-screen interactive control on representative Hub/Profile/Reader browser routes.
- No new console errors.
- Focus-visible, hover-capable, active, reduced-motion, and disabled states remain coherent.

## NEXT_ACTION
Read the twelve exact source files fully, then perform the first complete rewrite batch without partial editing.
