# B"H — Evidence Ledger and Scope

## User outcome
Rebuild the main Geelooy website navigation surfaces into one coherent, futuristic, simple social product. Preserve working Heichel and post internals. Exclude games and unrelated specialist tools. Every visible control must have a real route or API behavior.

## Directly observed project reality
- The served public root is `geelooy/`.
- Main routes exposed by the current navigation are `/`, `/heichelos`, `/heichelos/submit`, `/email`, `/profile`, `/notifications`, `/mawgawl/sefarim`, `/apps`, `/login`, `/register`, and `/about`.
- The root home page currently loads several overlapping CSS systems, including a home index that imports many generations of dashboard, future, lux, finish, recovery, and legacy rules.
- The screenshot shows duplicate top and bottom navigation, a narrow centered feed card, weak contrast, and excessive empty space on desktop.
- `appNavigation.js` already implements prefetch, scroll memory hooks, current-route marking, and View Transition navigation, but its route matcher omits search, notifications, login, register, and about.
- `shell/boot.js` already provides a shared bottom dock, drawer, scroll memory, spotlight, and toast region.
- Home feed APIs are already connected through the Heichel platform client.
- Profile APIs use `/api/social/alias/default`, `/api/social/aliases/details`, and alias Heichel detail routes.
- Notifications use real `/api/social/notifications/...` routes.
- Mail uses real `/api/social/mail/...` routes and preserves failed drafts.
- Sefarim search uses `/api/social/search/rag/shards` and `/api/social/search/rag/query`.
- Heichel directory cards and post pages already have working route/API behavior and should not be destabilized.
- Git status shows pre-existing changes only under `geelooy/games/mitzvahWorld/...`; those files are outside this mission and will not be touched.

## Tool issues observed
- Root `tree` failed because macOS denied access to `/Users/awtsmoos/.Trash`.
- Initial relative-cwd command calls returned correlation mismatches; absolute cwd fixed them.
- Chrome initially returned `ECONNREFUSED 127.0.0.1:9222`; the tunnel later launched a DevTools browser successfully.
- One async bulk-output call remained pending and required retry; synchronous `readManyLines` is now preferred for inspection.

## Scope boundary
### Included
Unified shell, home, spaces directory shell, profile, mail shell, notifications, Sefarim search, apps directory, login, register, about, navigation transitions, accessibility, responsive behavior, and API-aware states.

### Preserved
Heichel detail pages, series/post rendering, post editor behavior, comment systems, game pages, specialist apps, server APIs, and unrelated backend logic.

## Completion evidence required
- Full-file rewrites only.
- No touched source file over 150 lines unless server templating makes a smaller complete file impossible.
- Syntax checks for changed JavaScript.
- Existing navigation/style/profile tests plus new shell tests.
- Browser checks for desktop and mobile routes.
- API smoke tests restricted to safe GET endpoints, with mutation buttons verified structurally unless a non-destructive test identity is available.
