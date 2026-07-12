# B"H — Phase Three: Thirty Final Improvements

The second plan is safer, but a final review reveals where ambition must become precision.

1. Keep the initial implementation to the shared shell, home, and direct main navigation pages; do not redesign hidden specialist routes.
2. Treat Heichelos index as a bridge consumer of the new shell, not a redesign target.
3. Never remove old CSS files in this pass; stop importing them on rewritten pages first, then measure orphaned code later.
4. Ensure every new CSS file is below 150 lines.
5. Ensure every new JavaScript module is below 120 lines.
6. Use tabs for indentation in all new source.
7. Give every exported function complete JSDoc with practical behavior and a restrained poetic Awtsmoos image.
8. Use an HTML element factory in the shell renderer so route data is the source of truth.
9. Escape or assign text with `textContent`; never interpolate route labels into unsafe HTML.
10. Use semantic anchors for navigation and buttons only for actions.
11. Preserve native form actions as no-JavaScript fallbacks.
12. Let the command palette use anchors so selections remain reliable without custom routing.
13. Do not preload more than one document per hovered/focused route.
14. Do not cache full route HTML in JavaScript if it is never consumed.
15. Remove the unused `cachedRoutes` map to reduce memory and false SPA expectations.
16. Store scroll position by pathname and search, not one global last-route key.
17. Avoid synthetic notification counts; only show counts from API-backed attributes.
18. Remove hard-coded home metrics unless a live endpoint populates them.
19. Replace the large desktop empty dashboard areas with compact real utility cards.
20. Keep a clear “Explore spaces” empty-state action when a feed is genuinely empty.
21. Add loading and error semantics with `aria-live` and `aria-busy`.
22. Ensure the mobile dock never covers form buttons or the mail composer.
23. Ensure 44px minimum touch targets.
24. Use `clamp()` for typography, spacing, and shell widths.
25. Test high zoom by avoiding fixed heights on content panels.
26. Test reduced motion and forced-colors behavior structurally.
27. Give Apps cards concise descriptions so users can choose without opening every tool.
28. Keep auth forms server-native and do not convert them to fetch submission.
29. Treat live mutation testing as blocked without a disposable test alias; verify route shape and UI bindings instead.
30. Create a durable remaining-work ledger after implementation rather than pretending one pass can safely remove every legacy stylesheet.

## Revelations from the final review
- The prior home page tried to become futuristic by layering many visual generations. The result is not insufficient styling but insufficient authority. One compact stylesheet must win.
- Seamless navigation does not require unsafe SPA document swapping. A fast server route with prefetch, persistent visual grammar, scroll memory, and View Transitions can feel immediate while remaining debuggable.
- API correctness belongs in focused existing modules. The redesign should reveal those states, not rewrite proven endpoint logic without evidence.
- “Nothing is sacred” means the visible structure may change completely; it does not mean working data flows should be destroyed.

## Final implementation boundary
Implement the new shell and visual system across:
- Home
- Profile shell
- Mail shell
- Notifications
- Sefarim search
- Apps directory
- About
- Login/Register
- Heichelos directory shell integration

Preserve:
- Heichel detail
- Post detail
- Editors
- Comments
- Games
- Specialist app internals
- API implementations
