# B"H — Final Execution Plan

## Mission
Reveal one coherent Geelooy social application across every main navigation route while preserving working Heichel, post, editor, mail, profile, and API behavior.

## Files that will actually be touched in this pass

### New CSS modules
1. `style/geelooy-app/index.css`
2. `style/geelooy-app/tokens.css`
3. `style/geelooy-app/base.css`
4. `style/geelooy-app/shell.css`
5. `style/geelooy-app/surfaces.css`
6. `style/geelooy-app/home.css`
7. `style/geelooy-app/pages.css`
8. `style/geelooy-app/responsive.css`

### New shell modules
9. `scripts/awtsmoos/social/shell/appRoutes.js`
10. `scripts/awtsmoos/social/shell/appShell.js`
11. `scripts/awtsmoos/social/shell/appCommand.js`

### Existing shell/navigation files fully rewritten
12. `scripts/awtsmoos/social/shell/boot.js`
13. `scripts/awtsmoos/social/shell/routes.js`
14. `scripts/awtsmoos/social/navigation/appNavigation.js`
15. `scripts/awtsmoos/social/home/dashboard/feedSafeLoader.js`

### Main route files fully rewritten
16. `index.html`
17. `email/index.html`
18. `notifications/index.html`
19. `notifications/app.js`
20. `mawgawl/sefarim/index.html`
21. `apps/index.html`
22. `apps/style.css`
23. `apps/app.js`
24. `about/index.html`
25. `style/forms.css`
26. `login/index.html`
27. `register/index.html`

### Server templates bridged carefully by full rewrite
28. `profile/index.html`
29. `heichelos/_awtsmoos.index.html`

### Tests
30. `scripts/awtsmoos/social/shell/test/appRoutesContract.test.mjs`
31. `scripts/awtsmoos/social/shell/test/appShellContract.test.mjs`
32. `style/test/geelooyAppQuality.test.js`

## Module responsibilities
- `appRoutes.js`: labels, icons, descriptions, matchers, route groups, command visibility.
- `appShell.js`: semantic desktop rail, topbar, mobile dock, current route, progressive enhancement.
- `appCommand.js`: open/close, keyboard shortcut, filtering, focus restoration.
- `appNavigation.js`: safe prefetch, route-state transition, scroll memory, current-link state.
- CSS tokens: no page selectors, only variables.
- Shell CSS: layout/chrome only.
- Surfaces CSS: reusable panels/buttons/forms/states.
- Home CSS: feed-first dashboard only.
- Pages CSS: explicit classes for profile/mail/notifications/search/apps/about/auth.
- Responsive CSS: only breakpoints and safe-area rules.

## Verification before completion
1. Read back every changed file.
2. Count lines and split any oversized source.
3. Run `node --check` on every changed JavaScript file.
4. Run existing shell/navigation/profile/style tests.
5. Run new tests.
6. Probe safe GET routes on the live site.
7. Use Chrome to inspect desktop and mobile home, profile, mail, notifications, search, apps, about, login, register, and Heichelos directory.
8. Inspect console errors and network failures.
9. Click every shell route and every visible non-mutating page control.
10. Record mutations as structurally verified unless a disposable alias is available.
11. Compare planned files versus actual files and write a delta ledger.
12. Perform one correction pass for any failed evidence.

## Completion condition
The pass is complete only when the new shell is consistent, main routes render, links work, safe API reads succeed or fail visibly, deep Heichel/post pages remain untouched, tests pass, and remaining legacy cleanup is honestly recorded.
