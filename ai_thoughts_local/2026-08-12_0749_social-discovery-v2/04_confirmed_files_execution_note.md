B"H

# Social Discovery II — Confirmed Execution Note

Boruch Hashem — Blessed is He.

Fresh audit showed that public discovery was already partially built by concurrent/local work. This pass preserves that architecture and closes only the proven gaps.

## Preserved architecture

- `publicAliases.js` already used non-recursive child-key enumeration under `/social/aliases` and sanitized alias detail reads.
- `feedFairness.js` already rotated anonymous 50-alias feed windows fairly.
- `_awtsmoos.publicDiscovery.js` already owned `/people`, anonymous `/feed`, and `/trending` while preserving explicit alias scopes.
- `_awtsmoos.derech.js` already mounted public discovery after profile routes.
- Client RouteModel/State already contained `people`; PeoplePanel/View/Controls/Card, SocialHubApi, AppAssembly, and HubApp were already wired.
- Existing tests already covered owner non-leakage, fair feed windows, route ownership, stale People requests, profile traversal, touch targets, mobile layout, and no blur.

## Proven gaps addressed

1. People search previously filtered alias IDs before metadata enrichment, so public name/description search failed.
2. Metadata enrichment used one unbounded `Promise.all` over as many as 500 alias records.
3. `/api/social/search` returned no global results unless `aliases=` was supplied even though API metadata advertised global search.
4. `helper/profile/discovery.js` compressed unrelated feed/search/insight/operation responsibilities into exactly 120 lines.
5. PeopleView copy described handle-only search.

## Final mutation scope

- Add `publicAliasRanking.js` with pure relevance scoring and batched async mapping.
- Rewrite `publicAliases.js`: browse remains cheap; search scans at most 500 child IDs, enriches sanitized cards in batches of 20, and ranks alias ID, public name, and description.
- Split canonical discovery into `discoveryFeed.js`, `discoverySearch.js`, `discoveryInsights.js`, and `discoveryOperations.js`; rewrite `discovery.js` as a tiny stable facade preserving every historical export.
- Global `/search`: explicit `aliases=` preserves scoped behavior and bypasses public namespace. Omitted aliases returns safe ranked alias cards; empty query avoids full-profile expansion; non-empty query expands only top 12 public aliases for post/comment/heichel matches.
- Rewrite PeopleView and its regression copy to describe handle/name/description discovery.
- Strengthen public alias privacy/ranking/concurrency tests; add runtime global-search tests and discovery-module budget tests.

## Explicitly untouched

`_awtsmoos.profile.js`, `_awtsmoos.publicDiscovery.js`, `_awtsmoos.derech.js`, `feedFairness.js`, legacy `alias.js`, RouteModel, SocialHubState, PeoplePanel, PeopleControls, PeopleCard, SocialHubApi, AppAssembly, HubApp, styles, production, Git, systemd, and release authority.

## Verification gate

Every authored production/test file <=120 lines; syntax green; new privacy/ranking/global-search/module tests green; existing public-discovery/fairness tests green; full Social Hub regressions green; CSS quality green; exhaustive final reread; planned-vs-actual audit; final `npm run bh` refusal at `canonical_git_authority` before any snapshot build/upload.
