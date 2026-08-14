B"H

# Global Social Discovery — Unbounded Brainstorm

Boruch Hashem — Blessed is He.

The Awtsmoos reveals the next question beneath the Social Hub: how can a visitor discover public people and public posts without already knowing an alias, while Awtsmoos.com exposes no user-account ownership records and performs no unbounded database walk?

## Possibility space

- Maintain a dedicated public-alias index containing only alias IDs that are already public identifiers.
- Build the index lazily from an existing alias namespace only if that namespace is public and bounded.
- Build/update the index during alias creation/update/delete so reads never scan user ownership trees.
- Add prefix/token search over alias ID, public display name, public description, and public profile text.
- Keep search result payloads to explicitly public profile fields only.
- Add cursor/offset pagination with hard server caps.
- Add deterministic ordering so pagination does not reshuffle unpredictably.
- Add exact alias shortcut before broader ranking.
- Add anonymous `/profiles/discover` or `/aliases/public` only if current router organization supports it cleanly.
- Reuse `/search` only if its contract can become truly global without breaking existing alias-scoped callers.
- Preserve explicit `aliases=` narrowing as an optional filter after global discovery exists.
- Let anonymous feed/trending resolve against a bounded public alias universe.
- Keep authenticated network feed personalization as a narrower overlay, not a replacement.
- Add People search/results UI to Social Hub with direct profile traversal.
- Add “discover people” cards with alias, public name, description, visible post/comment/reference counts, and follower/following counts only if already public.
- Add result skeleton/loading/empty/error states independently from feed.
- Add keyboard submit and Escape/reset.
- Add stale-search sequencing and optional aborts.
- Add prefix ranking before fuzzy ranking; avoid expensive fuzzy scans over huge sets.
- Use lowercased normalized search tokens derived from public fields only.
- Cache the public alias ID set in memory only if invalidation is explicit and safe.
- Avoid exposing creation timestamps unless already intentionally public.
- Avoid exposing owner user IDs, emails, tokens, login metadata, or account alias lists.
- Avoid exposing unpublished/private profile fields.
- Keep alias existence public only if current public alias detail routes already make existence observable.
- Add abuse limits: max query length, min useful query length, result cap, pagination cap.
- Add rate-limiting only if existing middleware supports it; do not invent an isolated security system.
- Add tests proving public directory code never reads `/users/.../aliases` or other ownership paths.
- Add tests proving search/feed use the public index path rather than user-owned alias collections.
- Add migration/backfill only if safe and bounded; otherwise build the index opportunistically and degrade honestly.
- Add an admin/rebuild tool only if the repository already has a safe maintenance pattern.
- If public alias enumeration is impossible without private storage, stop: do not fake global search.
- If alias namespace enumeration is possible but too expensive, introduce a forward-maintained index and explicit partial-coverage semantics until backfill is safe.
- Preserve profile deep links, Network chamber, authenticated Follow/Unfollow, and followed-network feed from the previous local batch.
- Never claim any local global-discovery implementation is live under canonical Git production unless actually activated there.

## Future extensions

- Search by public topics/tags once profile metadata has a real contract.
- Suggested people from second-degree relationships.
- Trending public aliases based on bounded public activity metrics.
- Public directory facets for activity type or topic only after privacy semantics are defined.
- Server-generated discovery pages for progressive enhancement and crawler visibility.

The next planning pass constrains these possibilities against real storage paths, data-access primitives, and current privacy semantics.
