B"H

# Global Social Discovery — Storage & Privacy Surface Map

Boruch Hashem — Blessed is He.

This pass narrows the unbounded vision against the current Social architecture already proven in source. It intentionally marks storage facts as unverified until the next read-only audit reads the real helper/router/data-access code.

## Known current social surfaces

- Public profile detail exists by known alias ID.
- Public living-card detail exists by known alias ID.
- Public follower/following reads exist by known alias ID.
- Public feed/trending/search currently accept explicit alias narrowing.
- Search helper is not truly global today; it requires an alias set.
- Authenticated alias listing routes are scoped to the current logged-in user and are not a public directory.
- Follow/Unfollow is ownership-guarded by login plus `verifyAliasOwnership()` in current local source.
- Social Hub already has profile deep links, Network chamber, feed-author profile traversal, and authenticated followed-network feed personalization from the previous local batch.

## Storage questions that must be answered before mutation

1. Where is public alias identity stored independently of user ownership?
2. Does a top-level alias namespace exist that can be enumerated without reading `/users/...` ownership data?
3. Is alias ID itself intentionally public? Public detail routes strongly suggest yes, but enumeration semantics still require proof.
4. Does the database API support bounded child listing/pagination at a public alias namespace?
5. Does `getAliasIDs()` read a public alias namespace or a private user-owned alias list?
6. Does alias creation already write a global lookup/index path?
7. Does alias deletion clean that lookup path?
8. Is there a profile-publication or visibility flag that should filter directory inclusion?
9. Are all aliases public by design, or can aliases exist privately/unpublished?
10. Which fields from alias details are already returned by public alias detail routes?
11. Can profile public fields be aggregated without crossing into owner/user/account paths?
12. Are there existing cache/index helpers that can avoid repeated directory scans?
13. Is there an existing admin/maintenance index rebuild pattern?
14. Does the data layer expose `get` with `propertyMap`, pagination, or child-name listing suitable for bounded enumeration?
15. Is there a safe deterministic ordering of alias IDs?
16. What is the likely alias cardinality, and what hard cap is appropriate for anonymous discovery?
17. Can anonymous feed/trending operate on a bounded discovered alias set without exploding per-alias aggregation cost?
18. Can search rank candidates without loading every full profile?
19. Does any alias detail contain user ID, email, login metadata, or other fields that must be stripped?
20. Do profile search/result payloads already have a safe public normalization helper?

## Privacy invariants

- Never enumerate user ownership trees to construct a public alias directory.
- Never expose owner user IDs, emails, authentication/session data, alias ownership lists, or private account metadata.
- Never assume a field is public merely because it exists in storage.
- Prefer alias ID plus fields already proven public by anonymous detail routes.
- If alias visibility/publication semantics exist, directory inclusion must obey them.
- If no visibility contract exists, do not invent one silently; document the actual product semantics.
- Anonymous directory/search endpoints must be read-only and independently bounded.

## Performance invariants

- No unbounded recursive scan.
- No “load every full profile then filter” design.
- Hard result caps.
- Hard query length limits.
- Deterministic pagination/order.
- Anonymous feed/trending must use a bounded alias universe per request.
- If a global alias index must be introduced, writes should maintain it incrementally rather than forcing repeated discovery scans.

## Candidate implementation families — provisional only

Backend:
- alias public-index helper or public-directory helper;
- profile discovery helper rewrite/split;
- feed/trending alias-source helper;
- small router additions only if line-budget permits, otherwise route module split.

Client:
- SocialHubApi public people search/directory methods;
- new People controller/view/card modules;
- discovery integration that keeps anonymous feed and People search independent;
- focused CSS and tests.

## Files to inspect next

- `geelooy/api/social/helper/alias.js`
- `geelooy/api/social/_awtsmoos.alias.js`
- `geelooy/api/social/helper/profile/discovery.js`
- `geelooy/api/social/helper/profile/feed.js` or actual feed helper owner
- `geelooy/api/social/_awtsmoos.profile.js`
- database helper/client primitives used by alias helpers
- alias creation/update/delete call sites
- public alias detail route tests
- profile/feed/search tests
- current SocialHubApi/PublicDiscovery and related UI/tests/styles

The next audit must turn every storage question above into a source-backed answer before any public directory code is written.
