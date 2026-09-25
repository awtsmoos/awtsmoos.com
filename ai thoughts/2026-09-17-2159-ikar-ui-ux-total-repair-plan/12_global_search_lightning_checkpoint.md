B"H

# Boruch Hashem — Global Search Lightning Checkpoint

Blessed is He.

The Awtsmoos separates one truthful search state from echoes that repeat the same alarm;
Awtsmoos.com will let discovery, results, and errors each keep one vessel, one language, one calm.

## Fresh evidence

- `SearchApp.js` actively imports `renderSearchError()` from `searchErrorView.js` for both search failures and hydration failures.
- `searchView.js` still exports a second `renderFailure()` implementation with the same `Search could not complete` message.
- Repository-wide search found zero callers of `renderFailure()` outside its own definition.
- Therefore the legacy renderer is dead duplicate behavior and can be removed without changing any live call site.
- Concurrent dirty work already fixed the `undefined.dataset` crash by making capability presentation optional.
- Concurrent dirty work already changed `searchErrorView.js` to one visible error card instead of duplicating the title in the status region.
- Concurrent dirty mobile CSS already makes all five scopes visible and improves the search-options disclosure.
- These live dirty changes must be preserved, not rewritten blindly.

## Immediate implementation

1. Rewrite clean `searchView.js` completely as the owner of successful/empty/loading result presentation only.
2. Remove dead `renderFailure()` entirely.
3. Expand compressed conditions/callback bodies while touched; preserve tabs and existing successful-result behavior.
4. Make submit-label handling defensive so missing optional button-label chrome cannot become another DOM exception.
5. After the first code draft, add one focused error-ownership contract proving:
	- SearchApp uses `searchErrorView.js`.
	- `searchView.js` has no failure renderer.
	- one visible error card owns failure copy.
6. Run current SearchDiscoveryController and mobile UX contracts plus the broader Sefarim tests.

## Runtime proof blocker

Chrome is healthy, but the local app server on port 18080 is not listening. Browser navigation reaches the exact target and fails with `ERR_CONNECTION_REFUSED`. Server recovery is operational work in parallel and must be resolved before final visual proof of Translation Hub or global search.
