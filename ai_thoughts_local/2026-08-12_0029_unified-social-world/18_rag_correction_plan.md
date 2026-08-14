B"H

Boruch Hashem

Blessed is He

# Live RAG Correction Plan

The Awtsmoos does not need to search before knowing, yet Awtsmoos.com must reveal Torah through finite work that can end; this plan makes latency, breadth, and cancellation explicit rather than letting one query summon the whole corpus at once.

## Goal
Make universal private Torah search return a useful server-issued source set quickly and predictably while preserving the public source-session validation boundary and keeping deeper corpus breadth available through bounded work.

## Correction principles
1. Do not touch the physical WebSocket, universal protocol names, source-session ledger, selection validation, or publication handler.
2. The gateway should search small canonical lanes first because measured evidence shows they already return a full useful source set for the live integration prompt.
3. The gateway must never call unscoped `librarySearch()` for realtime chat, because that means 43 sidecars / roughly 598 MB may be launched in one request.
4. Named-lane searches remain compatible with the existing RAG engine and source normalization.
5. The first phase should run `meluket` and `sefer-hasichos` concurrently and merge/dedupe them.
6. If first-phase results satisfy the bounded public-source requirement, return immediately without touching multipart mega-corpora.
7. If first-phase results are sparse, deeper search must still be bounded. It may sample a deterministic small number of published parts from large lanes rather than launching every part.
8. Any deeper path must have explicit per-request row/time/part budgets and must close its streams when the budget ends. Promise-racing a caller without reclaiming work is not enough.
9. Preserve structured errors when no trusted source can be found; never fall back to arbitrary public text.
10. Add direct contracts that prove realtime search never invokes the unscoped all-lane library path and that the staged plan can return small-lane results without deeper search.

## Exact files to inspect before source writes
- `ayzarim/awtsmoosDynamicServer/websocket/apps/universalChat/sourceSearchGateway.js` — current normalization and error semantics.
- `geelooy/api/social/helper/search/rag/sidecarSearch.js` — source hit shape and stream lifecycle.
- `geelooy/api/social/helper/search/rag/textSearch.js` — logical-lane part resolution.
- `geelooy/api/social/helper/search/rag/librarySearchMerge.js` — existing multi-lane merge semantics.
- `geelooy/api/social/helper/search/rag/hydrate.js` / source normalization helpers as needed to avoid inventing an incompatible result shape.

## Preferred implementation shape
- Add a small `sourceSearchPlan.js` beside the universal-chat gateway. It owns ordered lane phases, dedupe, enough-results threshold, and deeper-search decision.
- Keep `sourceSearchGateway.js` as a thin orchestrator: run planned library search + Tanach independently, normalize, dedupe, cap results, choose preferred errors.
- Use the existing named-lane `librarySearch({lane})` contract for the first phase.
- If deeper search is needed, introduce a separate bounded sampler/service rather than re-enabling unscoped library fan-out.
- Only touch `sidecarSearch.js` if cancellation is actually required for the bounded sampler; because it is currently above 120 lines, any touch requires splitting it into smaller modules rather than trimming comments.

## Verification after correction
1. New unit contract for staged first-phase success and no unscoped call.
2. Existing `sourceSearchTimeout.test.js` stays green.
3. Existing 16-contract social suite stays green.
4. Isolated `searchTorahSources('Moshiach redemption')` must finish comfortably inside 30 seconds and leave no lingering process/stream work.
5. Clean live server with long process custody.
6. Hardened `realtime.integration.test.js` must prove real search, server-issued source selection, source-only publication, broadcast, history, and presence.
7. Then controlled Chrome/CDP proof across all requested widths.

## NEXT_ACTION
Read the complete current normalization/merge/hit-shape files, then choose the smallest bounded deeper-search implementation that preserves result quality without touching the large sidecar reader unless necessary.
