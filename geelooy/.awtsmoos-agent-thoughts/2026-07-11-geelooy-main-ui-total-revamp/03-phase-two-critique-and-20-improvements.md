# B"H — Phase Two Critique and Twenty Improvements

The first plan is directionally correct but too broad for one safe pass. The Awtsmoos is revealed here not through uncontrolled reach, but through exact boundaries: every visible chamber renewed, every working river preserved.

1. Do not attempt true client-side DOM swapping yet; page modules and server templates lack a unified lifecycle.
2. Preserve full server navigation as the reliability floor.
3. Use prefetch plus View Transitions for SPA-like speed without breaking page scripts.
4. Create one canonical route dataset and derive shell, mobile dock, and command results from it.
5. Remove games from the main social navigation because the user explicitly excluded them from this revamp.
6. Include Search, Notifications, Apps, About, Login, and Register in the seamless-navigation matcher.
7. Namespace every new selector under `.g-app` or `.geelooy-app-shell` to protect Heichel/post pages.
8. Let the shell renderer detect existing route-specific content instead of replacing it.
9. Hide legacy duplicate headers only on pages that boot the new shell.
10. Keep home feed API modules intact and replace only presentation plus broken fallback behavior.
11. Replace fictional fallback posts with an honest empty/error state so the UI never invents social content.
12. Preserve the home tabs and API modes but make the feed the visual center on desktop.
13. Make notifications auto-load the default alias and keep the manual alias field as an advanced control.
14. Refactor minified notifications logic into small complete modules.
15. Keep mail internals and API network code; only simplify its outer shell and improve responsive geometry.
16. Keep profile server authentication and existing modules; avoid duplicating alias logic.
17. Treat Sefarim search as a first-class main route and retain its GET-based API flow.
18. Rebuild Apps as a static curated directory without touching individual applications.
19. Update auth pages with a focused shared visual layer without moving or changing server handlers.
20. Add a visual contract test that rejects broad unnamespaced selectors and excessive CSS imports.

## Revised work graph

```text
Unified tokens
  ├── Shared shell renderer
  │     ├── Desktop rail
  │     ├── Top command bar
  │     ├── Mobile dock
  │     └── Command palette
  ├── Navigation contract
  ├── Home composition
  ├── Profile bridge
  ├── Mail bridge
  ├── Notifications composition
  ├── Search composition
  ├── Apps composition
  ├── Auth composition
  └── About composition
        ↓
Syntax + contract tests
        ↓
Live GET API probes
        ↓
Browser desktop/mobile route verification
```

## Reduced safe file set for implementation pass one
- New `style/geelooy-app/*` modules.
- New shell route/render/command modules.
- Rewrite `shell/boot.js`, `shell/routes.js`, and `navigation/appNavigation.js`.
- Rewrite `index.html`.
- Rewrite shell-facing HTML for email, notifications, Sefarim search, apps, about.
- Update profile template stylesheet/script includes with minimal markup changes.
- Rewrite notification behavior into modules.
- Update login/register stylesheet includes and shared auth CSS.
- Add tests.

## Deferred unless testing proves necessary
- Deep Heichel content styling.
- Post card renderer internals.
- Mail network protocol changes.
- Profile API mutations.
- True soft-navigation document swapping.
- Individual specialist app redesigns.
