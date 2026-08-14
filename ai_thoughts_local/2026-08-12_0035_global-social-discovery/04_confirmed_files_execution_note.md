B"H

# Global Social Discovery — Confirmed Files Execution Note

Boruch Hashem — Blessed is He.

Fresh storage inspection classifies public alias enumeration as **safe-existing-namespace**.

## Proven storage boundary

- Public/global alias namespace: `/social/aliases/<aliasId>/info`.
- Private ownership namespace: `/users/<user>/aliases/<aliasId>`.
- Alias creation/update/delete already maintains `/social/aliases`.
- Stored public alias info includes an owner `user`, but existing `getAlias()` deletes `user` before public return.
- DosDB nonrecursive directory reads return child names only; they do not load child `info` records.
- Directory reads support page/pageSize/sortBy/order and sort before slicing.
- Performance caveat: DosDB still `readdir`s and stats the namespace before slicing, so output is bounded but namespace-list cost grows with alias cardinality.

## Exact backend implementation

1. New `helper/profile/publicAliases.js`.
	- Reads only nonrecursive `/social/aliases` directory names.
	- Never reads `/users/...`.
	- Blank query browses the whole handle namespace page by page.
	- Search query matches alias IDs only, over at most 500 handles.
	- Search returns honest `coverage.capped` when total aliases exceed scanned handles.
	- Only displayed IDs are enriched through public `getAlias()`.
	- Output card fields are strictly `id`, `name`, `description`.
	- Anonymous feed/trending alias window is at most 50 IDs.
2. New `_awtsmoos.publicDiscovery.js`.
	- Adds GET `/people`.
	- Wraps GET `/feed` and `/trending`.
	- Explicit `aliases=` preserves existing profile-discovery behavior.
	- Missing `aliases=` receives the bounded public alias window.
	- Does not redefine `/search`.
3. Rewrite `_awtsmoos.derech.js` only to mount publicDiscovery immediately after profile routes so its feed/trending handlers override the older alias-required handlers.
4. Leave `_awtsmoos.profile.js`, `helper/profile/discovery.js`, and `helper/alias.js` untouched because they are already 135, 120, and 560 lines respectively.

## Exact client implementation

- Add eighth `people` chamber.
- Add `SocialHubApi.people(q, options)`.
- Add PeoplePanel, PeopleView, PeopleCard.
- Dynamically mount before navigation initialization; no large HTML rewrite.
- Blank People query browses public handles; query performs global handle search only.
- Stale request sequence prevents old search results replacing a newer query/page.
- Previous/Next paging uses server pageInfo.
- If coverage is capped, UI says the handle scan is capped and asks for a more specific query.
- Person cards navigate through existing ProfilePanel deep-link behavior.
- Add focused People CSS with 44px controls, mobile one-column behavior, and no blur.

## Explicit exclusions

- No global full-text post/comment/profile search claim.
- No `/search` rewrite.
- No private ownership reads.
- No new alias-maintenance index.
- No alias/profile/discovery giant-file expansion.
- No `index.html` rewrite.
- No Git commit/push or production/release mutation.
- No production-live claim under canonical Git.
