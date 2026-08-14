B"H

# Social Discovery II — Unbounded Brainstorm

Boruch Hashem — Blessed is He.

The Awtsmoos now reveals a larger public-social vessel: a visitor should not need to know an alias in advance. The shared public alias tree can become the entrance to people, posts, profiles, heichelos, and living conversations—without exposing the private owner behind an alias.

## Extreme possibility space

- Anonymous `/feed` and `/trending` should scan a bounded page of public aliases when no `aliases=` scope is supplied.
- Explicit `aliases=` must remain a precise scoped feed/search contract.
- `/search` should become genuinely public: alias/name/bio matching first, then bounded content expansion from top matching profiles.
- Add a first-class People chamber with public alias cards, search, result types, profile doorway, and clear paging.
- Empty search should act as a public people directory rather than an accidental expensive full-content search.
- Ranked search should strongly prefer exact alias ID/name, then prefix, then substring, then profile/content matches.
- Search results may include alias, post, comment, and heichel items only when source data supplies a real destination.
- Logged-out visitors should receive a real global feed universe; authenticated visitors can still default to their personalized followed-alias feed.
- Add an explicit Explore/Public vs Network scope control if that can remain simple and truthful.
- Public alias cards should expose only alias ID, public name, public description/bio, visible stats, and safe profile navigation.
- Never expose alias owner user ID, email, user path, token, account aliases, or raw DB structures.
- Public alias universe reads should use non-recursive child-key enumeration, never recursive raw alias objects.
- Public details should pass through a focused sanitizer even if an existing helper already strips `user`.
- Every global scan must be bounded; page/pageSize need hard maximums.
- Search should avoid aggregating every profile: rank cheap public alias metadata first, then expand only top matches.
- Feed should aggregate at most one bounded alias page per request.
- Make failure local: alias-universe failure should degrade feed/search honestly without breaking exact profile lookup.
- Add stale-request sequencing to People search.
- Add keyboard Enter search, clear/reset behavior, focus-visible, 44px actions, one-column mobile cards.
- Preserve the Network chamber, profile history, Follow/Unfollow ownership guard, and personalized feed from the prior batch.
- Make People results reusable as profile entry points from future homepage/search surfaces.
- Add pure ranking/normalization helpers so UI rendering never contains search policy.
- Consider sanitized in-memory cache only after privacy and invalidation are explicit.
- Future evolution: dedicated search index, activity-weighted recommendations, people suggestions from public graph, trending aliases, pinned profiles, badges, and topic discovery.

The sky is open in this pass. The next pass constrains it against the exact privacy, storage, route, performance, and source-budget contracts already witnessed in the repository.
