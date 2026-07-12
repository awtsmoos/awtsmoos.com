# B"H — Phase Two Improved Plan

## Design language
- Deep graphite/navy background, bright readable foreground, cyan-violet-magenta accents.
- One primary gradient only; secondary surfaces use translucent neutral layers.
- Desktop shell: 240px navigation rail, 760px feed/work column, 300px context rail when space permits.
- Mobile shell: one compact topbar and five-item safe-area dock.
- Rounded geometry is consistent: 14px controls, 20px cards, 28px major panels.
- Motion uses 160–260ms easing and honors reduced motion.

## Exact implementation sequence
1. Build namespaced CSS foundation modules.
2. Build canonical route data and shell renderer.
3. Rewire shell boot and navigation prefetch.
4. Rewrite home markup to one shell and one feed composition.
5. Replace fictional fallback feed content with honest states.
6. Attach shared shell to profile without changing its server/API contract.
7. Simplify mail outer HTML while preserving its mount and modules.
8. Rebuild notification markup and split behavior into state, API, render, and controller modules.
9. Rebuild Sefarim search markup around its existing GET API module.
10. Rebuild Apps directory and add client-side filter/category behavior.
11. Rebuild About into structured readable content.
12. Bridge Login/Register to the same visual vocabulary while preserving POST handlers.
13. Add route, shell, CSS, and main-page contract tests.
14. Run syntax, tests, GET API probes, and browser checks.
15. Re-read every touched file and compare planned versus actual.

## Exact files intended for creation
- `style/geelooy-app/index.css`
- `style/geelooy-app/tokens.css`
- `style/geelooy-app/base.css`
- `style/geelooy-app/shell.css`
- `style/geelooy-app/surfaces.css`
- `style/geelooy-app/home.css`
- `style/geelooy-app/pages.css`
- `style/geelooy-app/responsive.css`
- `scripts/awtsmoos/social/shell/appRoutes.js`
- `scripts/awtsmoos/social/shell/appShell.js`
- `scripts/awtsmoos/social/shell/appCommand.js`
- `notifications/modules/state.js`
- `notifications/modules/api.js`
- `notifications/modules/render.js`
- `notifications/modules/controller.js`
- `apps/app.js`
- `style/test/geelooyAppQuality.test.js`
- `scripts/awtsmoos/social/shell/test/appRoutesContract.test.mjs`
- `scripts/awtsmoos/social/shell/test/appShellContract.test.mjs`

## Exact existing files intended for full rewrite
- `index.html`
- `scripts/awtsmoos/social/navigation/appNavigation.js`
- `scripts/awtsmoos/social/shell/boot.js`
- `scripts/awtsmoos/social/shell/routes.js`
- `scripts/awtsmoos/social/home/dashboard/feedSafeLoader.js`
- `email/index.html`
- `notifications/index.html`
- `notifications/app.js`
- `mawgawl/sefarim/index.html`
- `apps/index.html`
- `apps/style.css`
- `about/index.html`
- `style/forms.css`

## Existing files to adjust only by full rewrite if required
- `profile/index.html`
- `login/index.html`
- `register/index.html`

## Verification matrix
| Area | Static verification | Runtime verification |
|---|---|---|
| Shell | Route and DOM contract tests | Current-route marks, drawer, command palette |
| Navigation | matcher tests | every main route click and back navigation |
| Home | no duplicate header/dock, no fictional fallback | feed GET, tabs, create/search links |
| Profile | template/script contract | aliases/default alias GET and tabs |
| Mail | mount/script contract | auth state, threads GET, compose validation |
| Notifications | API URL tests | default alias GET, list GET, safe read buttons |
| Search | form/API contract | shards GET and query GET |
| Apps | all hrefs non-empty | filter, category, selected links |
| Auth | server template preservation | GET page and form validation only |
| Responsive | CSS contract | 390px, 768px, 1440px screenshots |
