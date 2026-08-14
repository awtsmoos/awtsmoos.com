B"H

# Extreme Social — Post-Write Audit

Boruch Hashem — Blessed is He.

The Awtsmoos reveals this batch only after three planning passes, a fresh current-source/API audit, whole-file implementation, responsibility splitting, a failed first court that exposed test drift rather than product defects, a corrected final court, CSS quality, and exhaustive direct readback all agree.

## Original extreme goal

The user asked to push the social system much further: better feed, aliases/profiles, more social pages, deeper relationship navigation, and a cleaner public network experience. The planning pass intentionally explored global people search, profile deep links, network chambers, authenticated relationship actions, route restoration, better feed context, mobile clarity, and stronger modular/test boundaries.

## Current-source discoveries that changed the plan

Two fresh backend facts materially changed the final implementation.

1. Follow/Unfollow became safe to expose. Current `helper/profile/follows.js` now requires authenticated user identity and `verifyAliasOwnership()` before both follow and unfollow relationship writes. Denials use `LOGIN_REQUIRED` and `NOT_AUTHORIZED`.
2. Global public people search is still not honest. Current `/search` delegates to an alias-scoped helper that requires explicit `query.aliases`, while alias listing routes remain login/current-user scoped. No public all-alias directory exists.

Therefore the batch deliberately added real authenticated Follow/Unfollow but deliberately did **not** fabricate a global people directory/search.

## Actual implementation

### Social route and history graph

- Added a seventh first-class `network` route.
- Added pure `profileAliasFromLocation()` and `profileRouteUrl()` helpers.
- Navigation now witnesses both `hashchange` and `popstate`.
- Location synchronization carries the selected profile independently from chamber changes.
- Profile selection writes `?profile=<alias>#profile` without duplicating an identical current URL.
- Same-route profile changes and browser back/forward can reload the selected profile.
- Changing profile alias clears the previous profile object immediately so stale identity cannot masquerade under the new alias.

### Better feed

- Public feed requests now reject stale asynchronous responses with a sequence token.
- Logged-out discovery remains honest and does not pretend a global alias universe exists.
- When a verified acting alias exists, discovery reads up to 100 relationships and builds its feed alias set from the acting alias plus alias-type follows only.
- Latest/Trending therefore become a real network feed for an authenticated alias instead of structurally issuing an empty alias set.
- Feed cards extract real author alias identity and render a profile-navigation button only when a real alias exists.
- Primary post navigation remains unchanged and safe DOM APIs are used throughout.

### Public profile and authenticated relationship action

- Base profile and living-card enrichment load in parallel.
- Profile loads reject stale responses.
- Added `ProfileFollowController` as a separate stateful owner rather than putting mutation inside the renderer.
- Logged-out profile visitors receive guidance rather than a dead Follow button.
- The active alias viewing itself receives a self-profile state rather than a mutation button.
- Initial follow state scans following records in 200-item pages up to the backend 1,000-follow cap.
- Follow uses POST `/api/social/follows/:actingAlias` with `{ type: 'alias', id: targetAlias }`.
- Unfollow uses DELETE on the same guarded route.
- Successful relationship changes refresh the profile state.

### New Network chamber

- Added a dynamically mounted seventh workspace panel without rewriting the large Social Hub HTML shell.
- The Network chamber loads up to 100 followers and 100 following records in parallel.
- Network requests reject stale responses.
- Follower aliases and alias-type following targets open the existing Profile chamber.
- Non-alias followed objects remain typed context instead of fake profile links.
- Empty/loading/error states remain local to the Network subsystem.
- List rendering was split into `NetworkListRenderer` so the chamber view remained below the project source budget.

### App lifecycle

- Network/Profile mount before navigation performs its first location synchronization, allowing direct profile/network URLs to restore correctly on first initialization.
- Identity change now refreshes activity, profile, and the followed-alias network feed in parallel.
- Network refreshes when active and the acting alias changes.

### Presentation

- Added focused network styles behind an import-only aggregator.
- `social-network-core.css` owns network shell/grid/list structure.
- `social-network-actions.css` owns alias navigation, Follow affordance, and feed-author profile controls.
- New action controls have a 44px minimum reachability floor.
- Mobile Network layout collapses to one column and relationship targets become full-width where useful.
- No blur/backdrop-filter was added.
- CSS quality confirms ideal ownership, visual contracts, and cache-safe imports.

## Deliberate exclusions

- No fake global people search or public alias directory.
- No `_awtsmoos.profile.js` expansion; it was already 135 lines before this batch and was left untouched.
- No mutation of backend search helpers, alias router, or follow helper.
- No `index.html` rewrite.
- No Git commit/push.
- No production Git, systemd, remote-file, or release mutation.
- No claim that canonical production contains this local batch.

## Responsibility-split correction

The first implementation budget pass found only two over-budget owners:

- `NetworkView.js`: 124 lines.
- `social-network.css`: 142 lines.

They were split without behavior changes:

- `NetworkView.js` → 92 lines.
- new `NetworkListRenderer.js` → 48 lines.
- `social-network.css` → 7-line import aggregator.
- `social-network-core.css` → 74 lines.
- `social-network-actions.css` → 80 lines.

Final line-count proof job `cmdjob_mspjyx48_c06ceacec956` exited 0 and proves every authored production/style/test file in the batch is <=120 lines. The largest final authored source file is `ProfilePanel.js` at 116 lines.

## Test history and final verification

Initial full verification job `cmdjob_mspjhnaa_f1a022d16c80` ran 35 tests:

- 33 passed.
- 2 failed.
- Both failures were expectation drift in the new ownership-guard test, not product source defects.

The test had expected `FORBIDDEN`, while the current backend uses `NOT_AUTHORIZED`. It also expected `db.delete` for unfollow, while current unfollow writes both updated relationship arrays with `db.write`. Product source remained frozen.

After a single whole-file correction to `followOwnershipGuard.test.mjs`, final full rerun job `cmdjob_mspjl2u2_7ef27a88d4c9` exited 0:

- 35 tests total.
- 35 passed.
- 0 failed.

That court includes new extreme-social route/feed/history/network/follow contracts plus existing activity/comment/legal/profile/relationship/API/surface regressions.

CSS-quality job `cmdjob_mspjm4zo_18b06ab6cd24` exited 0 with:

`B"H cssQuality.test passed with ideal ownership, visual contracts, and cache-safe imports`

## Exhaustive readback

After the final green court, every touched production/style/test file was reread directly from disk, including routing, state, feed/discovery, API, profile/follow, Network panel/view/list renderer, app wiring, style aggregator/core/actions, and all seven new/rewritten extreme-social contracts.

The final planning contract and confirmed execution note were also reread before the source audit. No product discrepancy was found.

## Final local-state proof

Final line/status job `cmdjob_mspjyx48_c06ceacec956` exited 0.

- Every authored file is <=120 lines.
- Exact candidate paths are modified/untracked only as expected from the local Social Hub work.
- Git HEAD remains `6d05136b23e6921060a9ddb62cfefee5469614d3`.

The working tree is intentionally not normalized or reverted because it contains prior/concurrent local Social Hub work and Git is not the authority for these local source contents.

## Production/release boundary

Canonical production remains Git-authority and does not contain this local extreme-social batch. The local release guard must therefore refuse publication rather than claim success.

The final closeout action is one real `npm run bh` safety invocation. Expected result: nonzero `canonical_git_authority` before any snapshot build/upload, with unchanged HEAD and no new local snapshot artifacts.

This batch is locally implemented, deeply tested, structurally audited, and deliberately honest about the production boundary.
