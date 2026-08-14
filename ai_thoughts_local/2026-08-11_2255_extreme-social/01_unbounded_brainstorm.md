B"H

# Extreme Social — Unbounded Brainstorm

Boruch Hashem — Blessed is He.

The Awtsmoos reveals a social system not as a pile of disconnected widgets but as one living public graph: aliases are identities, profiles are public vessels, posts are authored light, relationships are navigable context, and every route should help a visitor understand where they are and what can truthfully be done next.

## Anything-goes possibility space

- Make `/social-hub/` begin with a real public network experience instead of private-dashboard residue.
- Turn exact alias lookup into richer public social discovery without pretending the current `/search` endpoint is global when it is not.
- Add a dedicated search/results model that can safely consume aliases, profiles, posts, references, and relationship entries when the API actually supplies them.
- Preserve exact alias-open as a first-class path even when broader search is unavailable.
- Make profile identity feel complete: display name, alias handle, description, authored-content counts, relationship counts, and clear public/owner view state.
- Add deep links so query/hash route state can open the correct profile chamber directly.
- Preserve the existing chamber/navigation system instead of inventing a competing route universe.
- Allow follower/following alias chips to open another profile in-place while preserving back/forward history.
- Add explicit Followers and Following chambers if current relationship data supports them cleanly.
- Add bounded relationship paging/loading when previews exceed living-card samples.
- Distinguish followed aliases from followed Heichelos/other target types instead of pretending every relationship points to a person.
- Add profile breadcrumbs or a compact visited-profile trail if it remains simple and accessible.
- Improve feed cards with human identity/context, one primary open action, and optional profile doorway.
- Make Latest/Trending filters deterministic, including clear active state and honest loading/empty/error states.
- Add contextual feed filtering only when supported by real API parameters.
- Add a public search box that can route exact aliases immediately and later host richer search providers.
- Add keyboard submit, Escape/reset behavior, focus-visible styling, and minimum 44px controls everywhere.
- Add owner-only composition/comment controls only when a verified alias exists.
- Logged-out public users should see login-to-act guidance, never dead mutation buttons.
- Preserve the deliberate refusal to expose Follow/Unfollow until server ownership authorization is hardened.
- Keep alias creation/default-selection confined to the verified identity bootstrap contract.
- Improve alias-selector clarity: current acting alias, verified alias count, public mode, and remembered selection state.
- Add a lightweight alias switcher summary without leaking account internals.
- Derive public profile stats from visible data, not hidden owner-only stores.
- Prefer names over storage IDs; never surface raw storage coordinates where a human label exists.
- Keep post context human-readable as `Heichel · Series`.
- Create shared empty-state language that is quiet, honest, and action-oriented.
- Add subsystem failure boundaries: feed failure must not kill profile lookup; relationship failure must not erase a valid profile; identity failure must not kill public discovery.
- Give loading state ownership to each subsystem so one slow request cannot freeze the whole hub.
- Add abort/cancellation for stale profile/search requests if navigation outruns responses.
- Avoid duplicate network requests when base profile and living-card enrichment are loaded together.
- Add bounded caching only if invalidation is obvious and identity/publication changes clear stale data.
- Normalize public alias identity, relationship targets, and feed items through small domain helpers.
- Separate transport, state, route, view, renderer, and normalization responsibilities more aggressively.
- Create one focused public-social route state owner instead of scattering URL parsing across components.
- Make back/forward navigation restore the active chamber and selected profile.
- Preserve progressive enhancement: static shell first, modules enrich second.
- Split CSS ownership across discovery, search, profile identity, relationships, feed cards, and mobile layout.
- Remove accidental blur-heavy overlays from social surfaces.
- Keep card density compact; avoid giant glass panels and repetitive zero-stat furniture.
- Mobile: one readable column, strong primary navigation, no horizontal overflow, no tiny pills.
- Tablet: relationship groups may use two columns only when labels remain readable.
- Desktop: keep profile/search surfaces centered rather than sprawling edge-to-edge.
- Accessibility: real labels, status regions, focus-visible, meaningful headings, no fake clickable divs.
- Safe DOM only: no `innerHTML`, no `insertAdjacentHTML`, no string-built unsafe markup.
- Tests should freeze route semantics, safe DOM use, owner/public action gating, relationship typing, touch targets, line budgets, and no-blur rules.
- Add production-like browser smoke tests for logged-out discovery and direct profile deep links.
- Record exact current API truth in tests so retired route families cannot silently return.
- Keep release truth explicit: local source may improve radically, but canonical Git production is a separate authority and must never be described as live unless actually activated there.

## Extreme future directions intentionally not committed yet

- True global alias/post search backed by a dedicated index.
- Authorized follow/unfollow after backend ownership checks are added.
- Notifications/inbox tied to verified aliases.
- Public activity timelines blending followed aliases and authored content.
- Profile collections, pinned posts, public badges, alias directory, richer graph visualization, and reactions after abuse/visibility contracts are verified.

This pass deliberately keeps the sky open. The next pass narrows these possibilities against the actual repository and API surface before any product code is rewritten.
