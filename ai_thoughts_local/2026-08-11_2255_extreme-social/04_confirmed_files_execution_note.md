B"H

# Extreme Social — Confirmed Files Execution Note

Boruch Hashem — Blessed is He.

Fresh source inspection changed two earlier assumptions. Current relationship mutation is now guarded by login plus `verifyAliasOwnership`, so authenticated Follow/Unfollow can safely enter the client. Conversely, current `/search` is still alias-scoped and public alias enumeration does not exist, so this batch will not fabricate a global people directory.

## Exact implementation

1. `js/navigation/RouteModel.js`
	- Add seventh `network` route.
	- Add pure `profileAliasFromLocation()` and `profileRouteUrl()` helpers.
	- Preserve existing route lookup/button/url semantics.
2. `js/navigation/NavigationController.js`
	- Add `popstate` plus hash synchronization.
	- Emit location context independently of route changes so same-route profile history reloads.
3. `js/state/SocialHubState.js`
	- Add `network` to valid tabs only; preserve all existing state shape.
4. `js/ui/PublicDiscovery.js`
	- Add request sequencing so stale Latest/Trending responses cannot overwrite newer mode.
	- Delegate profile opening to ProfilePanel deep-link navigation.
5. `js/ui/PublicFeedCard.js`
	- Export alias extraction helper.
	- Make real author identities profile-navigation buttons; preserve safe DOM and primary post link.
6. `js/api/SocialHubApi.js`
	- Add guarded POST `follow()` and DELETE `unfollow()` client methods.
7. `js/profile/ProfilePanel.js`
	- Add parallel base/living-card loading with stale-request sequencing.
	- Deep-link selected aliases through `?profile=` + `#profile` while reusing existing navigation.
	- Coordinate new Follow controller.
8. `js/profile/ProfileFollowController.js` (new)
	- Logged-out guidance; self-profile state; authenticated Follow/Unfollow.
	- Scan following in 200-item pages up to 1,000 records for accurate initial state.
	- Safe DOM only; refresh profile after mutation.
9. `js/network/NetworkPanel.js` + `NetworkView.js` (new)
	- Dynamically mount seventh workspace panel before navigation initialization.
	- Load up to 100 public followers/following records in parallel.
	- Alias entries open profiles; non-alias targets remain typed context.
	- Request sequencing prevents stale network results.
10. `js/AppAssembly.js` / `js/HubApp.js`
	- Wire network and navigation location callbacks.
	- Mount Network panel before navigation renders routes.
	- Restore direct/back-forward profile state and load Network route data.
11. `style.css` + new `styles/social-network.css`
	- Style Network chamber, author-profile buttons, and Follow affordance.
	- 44px controls, no blur, mobile one-column network.
12. Tests
	- Rewrite `stateRoute`, `publicDiscovery`, `socialRelationshipsApi` for new contracts.
	- Add `routeHistory`, `profileFollowController`, `networkPanel`, `followOwnershipGuard`.
	- Existing relationship preview tests remain valid because mutation lives in a separate controller.

## Explicitly not changing

- No fake global search or alias directory.
- No `_awtsmoos.profile.js` expansion; it is already 135 lines.
- No backend search/helper/alias/follows mutation in this batch.
- No `index.html` rewrite.
- No Git commit/push.
- No production/systemd/release mutation.
- No claim that these local changes are live under canonical Git production.

## Verification gate

- Every authored source/style/test file <=120 lines.
- Syntax checks on all touched JS.
- Focused new tests plus existing Social Hub regressions.
- CSS quality.
- Full touched-file reread.
- Planned-vs-actual audit.
- `npm run bh` must still refuse `canonical_git_authority` before build/upload.
