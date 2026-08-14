B"H

# Extreme Social — Architecture & Surface Map

Boruch Hashem — Blessed is He.

This second pass narrows the unbounded brainstorm against the social architecture already proven in the repository and production evidence. It is still pre-mutation: anything listed as uncertain must be re-read from current source before implementation.

## Known public Social Hub owners

- `geelooy/social-hub/js/api/SocialHubApi.js` — public feed/trending/search/profile/living-card/follower/following transport plus delegated private activity/interactions.
- `geelooy/social-hub/js/ui/PublicDiscovery.js` — Latest/Trending state and public profile doorway.
- `geelooy/social-hub/js/ui/PublicDiscoveryView.js` — public discovery DOM shell.
- `geelooy/social-hub/js/ui/PublicFeedCard.js` — safe public feed-card renderer.
- `geelooy/social-hub/js/ui/IdentityController.js` — alias bootstrap/public-mode behavior.
- `geelooy/social-hub/js/navigation/NavigationController.js` — chamber/hash state; must be reread before deep-link changes.
- `geelooy/social-hub/js/profile/ProfilePanel.js` — base profile load and optional living-card enrichment.
- `geelooy/social-hub/js/profile/ProfileRenderer.js` — profile identity/stats/content sections.
- `geelooy/social-hub/js/profile/ProfileRelationships.js` — bounded read-only relationship rendering.
- `geelooy/social-hub/js/profile/PostCard.js` and `ProfileCards.js` — authored-content cards.
- `geelooy/social-hub/js/state/SocialHubState.js` — identity/profile/navigation state; must be reread before route-state expansion.
- `geelooy/social-hub/js/AppAssembly.js` / `HubApp.js` — dependency wiring/lifecycle.
- `geelooy/social-hub/style.css` plus focused discovery/profile CSS owners.

## Proven current API families from previous source inspection

- `GET /api/social/feed`
- `GET /api/social/trending`
- `GET /api/social/search` — contract is not assumed global; helper behavior must be reread before new search UI.
- `GET /api/social/profiles/:alias`
- `GET /api/social/profiles/:alias/living-card`
- `GET /api/social/follows/:alias`
- `GET /api/social/followers/alias/:alias`
- safe identity bootstrap module exists locally at `/unified-social/identity` route family, but canonical production currently serves a different Git authority and must not be assumed to contain local changes.

## Proven security boundary

Current follow write helpers were previously found to lack an ownership guard at the storage-helper level. Therefore this extreme UI pass must remain **read-only for Follow/Unfollow** unless step C proves the backend was independently hardened since that inspection.

## Product surface problems worth solving locally

1. Public discovery still lacks a richer search/result experience.
2. Exact profile lookup is useful but not expressive enough for a network feeling.
3. Profile deep links/back-forward restoration need stronger route-state ownership.
4. Relationship previews are useful but not yet a full navigable social chamber.
5. Public profile identity can become more coherent and compact.
6. Feed items can expose a profile doorway when identity metadata exists.
7. Public/owner action boundaries should be made visually obvious everywhere.
8. Loading/error states can be isolated per subsystem.
9. Mobile profile/relationship navigation can be made more deliberate.
10. Tests can cover route state and end-to-end public flows more deeply.

## Architecture direction

- Keep API transport pure and explicit.
- Add one focused route-state owner rather than spread URL parsing across views.
- Add one focused public-search controller and one focused search-result renderer if the API contract supports it.
- Add relationship-list controller/view only if bounded GET endpoints provide enough shape beyond living-card previews.
- Keep profile loading resilient: base profile succeeds even if relationship enrichment fails.
- Keep public discovery useful without authenticated alias bootstrap.
- Use composition, not decorative inheritance; Kabbalistic documentation belongs in real architectural vessels rather than fake class hierarchies.
- No raw HTML sinks.
- No global CSS overrides when a focused style owner can contain the rule.
- Every new authored source/style/test file <=120 lines; split responsibilities before testing.

## Provisional files to inspect in step C

- `geelooy/social-hub/js/navigation/NavigationController.js`
- `geelooy/social-hub/js/navigation/*`
- `geelooy/social-hub/js/state/SocialHubState.js`
- `geelooy/social-hub/js/ui/PublicDiscovery.js`
- `geelooy/social-hub/js/ui/PublicDiscoveryView.js`
- `geelooy/social-hub/js/ui/PublicFeedCard.js`
- `geelooy/social-hub/js/api/SocialHubApi.js`
- `geelooy/social-hub/js/profile/ProfilePanel.js`
- `geelooy/social-hub/js/profile/ProfileRenderer.js`
- `geelooy/social-hub/js/profile/ProfileRelationships.js`
- `geelooy/social-hub/js/AppAssembly.js`
- `geelooy/social-hub/js/HubApp.js`
- `geelooy/api/social/_awtsmoos.profile.js`
- `geelooy/api/social/helper/profile/discovery.js`
- `geelooy/api/social/helper/profile/follows.js`
- current Social Hub tests/styles relevant to navigation/search/profile.

## Risks to re-check before source mutation

- Search response envelope and query requirements may have changed.
- NavigationController may already normalize query/hash state differently than remembered.
- Existing concurrent local edits may have changed any file since the previous social batch.
- Profile relationship arrays may contain more target variants than alias/heichel.
- Current line counts may force additional splits before any behavior change.
- Canonical production Git does not currently carry these local improvements, so all results of this batch are local-source improvements unless the deployment authority changes.

Step C now reads the real current files and converts this provisional map into one exact mutation contract.
