# B"H — Phase One Theoretical File Map

## New shared application system
- `style/geelooy-app/index.css` — one import surface.
- `style/geelooy-app/tokens.css` — color, type, spacing, radii, shadows, z-index.
- `style/geelooy-app/base.css` — reset, document, focus, reduced motion.
- `style/geelooy-app/shell.css` — desktop rail, topbar, mobile dock, command overlay.
- `style/geelooy-app/surfaces.css` — cards, buttons, pills, forms, states.
- `style/geelooy-app/home.css` — feed-first home composition.
- `style/geelooy-app/pages.css` — profile, notifications, search, apps, about, auth bridges.
- `style/geelooy-app/responsive.css` — tablet, mobile, safe-area.
- `scripts/awtsmoos/social/shell/appRoutes.js` — canonical route metadata.
- `scripts/awtsmoos/social/shell/appShell.js` — data-driven shell renderer.
- `scripts/awtsmoos/social/shell/appCommand.js` — route filtering and keyboard command palette.
- `scripts/awtsmoos/social/shell/appStatus.js` — status and retry helpers.

## Existing files likely rewritten
- `index.html` — remove duplicate headers and compose a clean feed-first dashboard.
- `scripts/awtsmoos/social/navigation/appNavigation.js` — cover all main routes and preserve forms.
- `scripts/awtsmoos/social/shell/boot.js` — boot the new renderer and existing utilities.
- `scripts/awtsmoos/social/shell/routes.js` — compatibility export from canonical routes.
- `profile/index.html` — load the new system while preserving server identity logic and profile modules.
- `email/index.html` — simplify duplicate header and keep the mail app mount/API modules.
- `notifications/index.html` — new signal-center composition and shared shell.
- `notifications/app.js` — readable modular behavior, default alias hydration, retries, safe mutation bindings.
- `mawgawl/sefarim/index.html` — unified search shell while retaining RAG API behavior.
- `apps/index.html` — curated launcher markup and filter metadata.
- `apps/style.css` — replace legacy visual layer with namespaced app-directory rules or retire it in favor of shared CSS.
- `about/index.html` — structured readable article inside the shared shell.
- `login/index.html` and `register/index.html` — preserve server handlers while adopting shared auth styles.
- `style/forms.css` — auth-only focused redesign, if existing selectors can be safely isolated.

## Files intentionally preserved
- `heichelos/post/**`
- `heichelos/heichel/**`
- `heichelos/_awtsmoos.post.html`
- `heichelos/_awtsmoos.heichel.html`
- Post editor, comments, uploads, series rendering, games, specialist apps, backend routes.

## Tests likely added or rewritten
- `scripts/awtsmoos/social/navigation/test/appNavigationContract.test.mjs`
- `scripts/awtsmoos/social/shell/test/appRoutesContract.test.mjs`
- `scripts/awtsmoos/social/shell/test/appShellContract.test.mjs`
- `style/test/geelooyAppQuality.test.js`
- `tests/geelooy-main-routes-smoke.mjs`

## Call-stack maps
### Navigation click
Anchor click → `shouldHandleRoute` verifies same-origin and main-route membership → scroll state saved → View Transition adds navigation state → browser requests real server route → server renders page → shell boot marks current route and restores route-specific state.

### Home feed
Dashboard boot → feed-safe loader → live feed module → platform API client → normalized feed objects → card renderer → fallback only on timeout/import failure.

### Profile
Server verifies session → page exposes user id → `profile/script.js` → profile API module → aliases/default alias/Heichel details → cards and stats → mutation actions retain existing API methods.

### Notifications
Shell boots → default alias GET → notification list GET → filter state → cards → mark-read POST or mark-all POST → list refresh GET.

### Search
Search form submit → RAG query GET with URLSearchParams → range hits normalized → range cards → precise source/comment links.

### Mail
Mail layout mounts → auth/default alias resolves → threads GET → thread history GET → composer POST only on explicit user send → failures preserve draft and expose status.
