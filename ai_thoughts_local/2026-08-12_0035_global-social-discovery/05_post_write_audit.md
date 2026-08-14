B"H

# Global Social Discovery — Post-Write Audit

Boruch Hashem — Blessed is He.

The Awtsmoos reveals this batch only after three physical planning passes, a storage/privacy audit of the real alias namespace and DosDB listing semantics, whole-file implementation, a responsibility split, syntax/backend/client regression courts, CSS quality, and a complete post-test reread all agree.

## Original goal

Make anonymous social discovery genuinely larger: real public-handle discovery plus a non-empty bounded anonymous feed/trending source, without converting private user ownership data into a public directory and without redefining the existing multi-kind `/search` route dishonestly.

## Storage/privacy classification

The fresh audit classified the current storage model as **safe-existing-namespace**.

- Public/global alias namespace: `/social/aliases/<aliasId>/info`.
- Private ownership namespace: `/users/<user>/aliases/<aliasId>`.
- Alias creation/update/delete already maintains the global alias namespace.
- Stored alias info includes an owner `user`, but public `getAlias()` deletes `user` before return.
- DosDB nonrecursive directory reads return child names only and do not descend into child `info` records.
- DosDB directory listing supports deterministic `page`, `pageSize`, `sortBy`, and `order` behavior.
- No global-discovery source reads `/users/...`.

Performance caveat: DosDB still performs a directory read/stat pass before slicing, so output is strictly bounded but namespace-list cost still grows with total alias cardinality. This is a future indexing/performance target, not a privacy leak.

## Actual backend implementation

### `helper/profile/publicAliases.js`

- Reads only nonrecursive `/social/aliases` child names.
- Public browse default limit is 12, hard max 24.
- Handle-search query is sanitized/lowercased and capped at 80 characters.
- Handle search scans at most 500 alias IDs.
- Search returns `coverage.capped` plus `scanLimit` when total aliases exceed scanned coverage.
- Only aliases on the displayed result page are enriched through existing public `getAlias()`.
- Public person cards return only `id`, `name`, and `description`.
- Anonymous feed/trending alias windows are capped at 50 IDs.
- Explicit alias callers do not use this public alias enumeration path.

### `_awtsmoos.publicDiscovery.js`

- Adds GET `/people`.
- Owns GET `/feed` and `/trending` after profile-route composition.
- Explicit `aliases=` retains existing scoped behavior.
- Missing aliases receive the bounded public alias window.
- `/search` is intentionally not defined or overridden.
- Existing `profileFeed()` and `trending()` implementations remain unchanged.

### `_awtsmoos.derech.js`

- Imports the focused public-discovery route module.
- Spreads `...profile(vessel), ...publicDiscovery(vessel)` in that order so bounded anonymous feed/trending replaces only the older same-key handlers.
- Existing social route families remain composed.
- The already-over-budget `_awtsmoos.profile.js`, exactly-120-line discovery helper, and 560-line alias helper remain untouched.

## Actual client implementation

### Eighth People chamber

- `people` is a first-class eighth social route/tab.
- `SocialHubApi.people(q, options)` calls `/api/social/people`.
- `PeoplePanel` owns query/page/stale-request sequencing.
- `PeopleView` dynamically mounts the People panel before navigation initialization.
- `PeopleControls` owns bounded handle search and Previous/Next paging controls.
- `PeopleCard` renders only public `name`, `@id`, description, and an existing Profile doorway.
- Blank query browses public handles page by page.
- Query is explicitly described as global **handle** search, not full-text post/comment/profile search.
- Capped search coverage is stated visibly and asks the visitor to refine the query.
- Stale People responses cannot overwrite newer search/page state.
- Opening a person reuses the existing deep-link Profile chamber.

### Presentation

- People styles were split behind a stable import aggregator.
- `people-discovery-core.css` owns panel/result/card/mobile structure.
- `people-discovery-actions.css` owns search/pager/profile actions.
- Action controls have a 44px minimum reachability floor.
- Mobile results collapse to one column.
- No blur or backdrop-filter is introduced.

## Deliberate exclusions

- No global full-text `/search` claim or rewrite.
- No private `/users/...` ownership enumeration.
- No owner user IDs, email, session/login metadata, or ownership lists in public results.
- No request-time full-profile scan.
- No new public alias maintenance index because the current global namespace is already sufficient for bounded discovery.
- No expansion of the 135-line profile router, 120-line discovery helper, or 560-line alias helper.
- No `index.html` rewrite.
- No Git commit/push.
- No canonical production Git, systemd, or release-authority mutation.
- No production-live claim.

## Responsibility split

The first behavior pass found two over-budget People owners:

- `PeopleView.js`: 137 lines.
- `people-discovery.css`: 150 lines.

They were split without behavior changes:

- `PeopleControls.js`: 61 final lines.
- `PeopleView.js`: 101 final lines.
- `people-discovery.css`: 7-line aggregator.
- `people-discovery-core.css`: 77 final lines.
- `people-discovery-actions.css`: 78 final lines.

Final full reread job `cmdjob_mspn40jt_09ddea89970b` exited 0 and captured 58,811 stdout characters. Its final line-count block proves every authored touched backend/client/style/test file is <=120 lines. Notable final counts:

- `publicAliases.js`: 110.
- `_awtsmoos.publicDiscovery.js`: 60.
- `_awtsmoos.derech.js`: 102.
- backend directory test: 71.
- backend route test: 68.
- `RouteModel.js`: 73.
- `SocialHubState.js`: 114.
- `SocialHubApi.js`: 101.
- `PeopleCard.js`: 45.
- `PeopleControls.js`: 61.
- `PeopleView.js`: 101.
- `PeoplePanel.js`: 60.
- `AppAssembly.js`: 71.
- `HubApp.js`: 93.
- People CSS aggregator/core/actions: 7 / 77 / 78.
- `stateRoute.test.mjs`: 56.
- `peopleDiscovery.test.mjs`: 79.

## Verification court

Main syntax/test job `cmdjob_mspmxw4t_b0eb5e6e1d02` exited 0.

- All touched backend/client JS/CJS modules passed syntax checks.
- 49 tests ran.
- 49 passed.
- 0 failed.

The court includes:

- public alias privacy: no `/users/` reads;
- owner-bearing stored info reduced to public `id/name/description` card fields;
- nonrecursive public namespace listing;
- bounded search coverage and honest cap metadata;
- 50-alias anonymous feed cap;
- explicit alias scopes bypass public enumeration;
- public route ownership/order and no `/search` override;
- People route/API/stale/paging/profile traversal/safe DOM/mobile contracts;
- all prior extreme-social feed/profile/network/follow/activity/comment/legal/surface regressions.

CSS-quality job `cmdjob_mspmytp0_22ff51a8aafe` exited 0 with exact output:

`B"H cssQuality.test passed with ideal ownership, visual contracts, and cache-safe imports`

## Exhaustive final reread

After the green court, the final planning contract, confirmed execution note, every touched backend/client/style/test file, final line counts, exact candidate status, and HEAD were reread through job `cmdjob_mspn40jt_09ddea89970b` in full across its paged 58,811-character output.

No implementation discrepancy was found.

## Final local state before release-authority proof

Exact candidate status contains only the expected modified/untracked local global-discovery and Social Hub paths. No unrelated work was reverted.

Git HEAD remains:

`6d05136b23e6921060a9ddb62cfefee5469614d3`

## Remaining production boundary

Canonical production is still Git-authority and does not contain this local batch. The final closeout is therefore exactly one real `npm run bh` safety invocation. Expected successful safety outcome:

- nonzero exit;
- exact `canonical_git_authority` refusal;
- no `buildLocalSnapshot.mjs` or `publishLocalSnapshot.mjs` output;
- unchanged HEAD;
- no new local snapshot archive/receipt/list artifact.

This batch is locally implemented, privacy-audited, globally useful at the handle layer, fully tested, structurally reread, and deliberately honest about its production boundary.
