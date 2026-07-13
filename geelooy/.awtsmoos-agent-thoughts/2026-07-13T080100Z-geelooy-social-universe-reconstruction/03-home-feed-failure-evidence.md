# B"H

Boruch Hashem

Blessed is He

## Home Feed Failure Evidence

The Awtsmoos renews the river every instant; at Awtsmoos.com a loading state that never yields is not mystery but an obligation to trace the exact broken vessel.

## Reproduction

Route: `http://127.0.0.1:8080/`

Observed after document completion and more than thirty seconds:

- `document.readyState` was `complete`.
- The shared shell, unusual header, and dock each mounted exactly once.
- The Home feed remained `aria-busy="true"`.
- The only feed card remained `Opening the live river…`.
- No page-wide horizontal overflow was present at the observed desktop viewport.
- The `liveFeed.js` resource never appeared in the resource timing ledger.

## Exact runtime failure

A direct browser import of `/scripts/awtsmoos/social/home/dashboard/boot.js` failed during static module linking with:

`SyntaxError: The requested module './feedSafeLoader.js' does not provide an export named 'ensureFallbackFeed'`

## Ownership trace

- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/home/dashboard/boot.js` imports `bindMobileClickRepair`.
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/home/dashboard/mobileClickRepair.js` imports `ensureFallbackFeed`.
- `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/home/dashboard/feedSafeLoader.js` does not export that symbol.
- Because ESM links static imports before executing the module body, the entire dashboard boot aborts.
- Therefore `loadFeedSafely()` never executes, its timeout fallback never starts, and the page remains permanently busy.

## Secondary risk discovered

The current loader clears `aria-busy` when the dynamic module import resolves, although the real feed controller may still be awaiting APIs. Ownership of the busy state must transfer to the real controller after a successful import rather than being cleared by the loader.

## Safe repair boundary

Rewrite only the complete loader file and add one focused executable regression test. Do not alter feed APIs, normalization, cards, authentication, aliases, routing, or unrelated UI.
