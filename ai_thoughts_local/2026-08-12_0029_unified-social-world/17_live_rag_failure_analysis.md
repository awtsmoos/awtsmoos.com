B"H

Boruch Hashem

Blessed is He

# Live RAG Failure Analysis

The Awtsmoos contains every Torah source without latency, while Awtsmoos.com must still choose finite vessels wisely; this record replaces the vague phrase “live RAG timeout” with measured architecture and reproducible evidence.

## Live failure
- A clean authoritative server owned port 8080 and accepted three universal-chat WebSocket clients.
- Presence admission completed, proving the router, physical WebSocket, application envelope, and universal presence protocol were alive.
- The hardened integration then sent `universalChat.search` with prompt `Moshiach redemption`.
- No correlated search response arrived within the client’s 60-second deadline.
- The server remained alive during that failure; it was only SIGTERM’d later by the tunnel server-job timeout.

## Search chain observed
`searchHandlers.js` -> `sourceSearchGateway.js` -> unscoped `librarySearch()` + Tanach search.

The Tanach branch rejects the English query before loading its index, so it is not the blocker.

The unscoped library branch calls every published library lane concurrently. Each logical lane can itself fan out across every part concurrently through `textSearchShard()` and `searchSidecar()`.

## Exact live corpus fan-out
Database root: `/Users/awtsmoos/Documents/awtsmoos/dayuhChadash`.

Project-native `availableShards()` reports:
- `likkutei-sichos`: 221,043 rows, 28 parts, 338,365,529 bytes of text sidecars.
- `sichos-kodesh`: 68,490 rows, 12 parts, 169,606,775 bytes.
- `tanach-hebrew-verses`: 23,204 rows, one sidecar, 25,043,165 bytes.
- `sefer-hasichos`: 15,022 rows, one sidecar, 14,372,869 bytes.
- `meluket`: 6,139 rows, one sidecar, 51,245,740 bytes.

One unscoped library request therefore opens up to 43 sidecars / roughly 598 MB of text mirrors and may parse up to roughly 344,000 rows before merge.

## Timeout weakness
The existing `settleWithin()` timeout races the result promise but does not cancel the sidecar work underneath it. An isolated call to the current `searchTorahSources()` produced no output before the 45-second worker deadline; SIGTERM cleanup itself timed out. This independently reproduces the performance pathology without WebSockets.

## Small-lane evidence
Using the exact same library search engine and exact live query, but naming one lane:
- `meluket`: 12 hits in about 4.5 seconds.
- `sefer-hasichos`: 12 hits in about 7.4 seconds.

This proves useful server-issued Torah sources exist before the 40-part mega-corpora are searched.

## Root cause
The universal-chat gateway chooses corpus breadth before latency and cancellation. It launches the largest possible aggregate search even when smaller canonical lanes already satisfy the result requirement. The per-corpus promise timeout is too high in the stack to reclaim the sidecar fan-out it has already launched.

## Security conclusion
No evidence points to a source-validation or publication-boundary defect. The failure is resource planning. The correction must preserve server-issued source sessions and source-only public publication while making private search bounded, staged, and predictable.
