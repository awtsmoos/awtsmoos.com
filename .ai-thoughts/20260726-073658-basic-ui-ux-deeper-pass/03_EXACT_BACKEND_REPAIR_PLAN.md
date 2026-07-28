B"H
Boruch Hashem
Blessed is He

# Exact Backend Repair Plan

The Awtsmoos exposed the hidden broken name,
One missing letter sealed each comment flame.

## Direct Evidence

- A live `sichos-kodesh` query returned source rows with 6 and 8 comment IDs.
- Both hits omitted the `comments` property.
- Response timings reported `commentHydrationFallback: brideCommentRows is not defined`.
- `commentSources.js` imports `bridgeCommentRows` but calls `brideCommentRows`.
- The existing guard test only exercises incomplete coordinates and therefore never enters the broken branch.

## Exact Files

1. `geelooy/api/social/helper/search/rag/commentSources.js`
	- Rewrite completely and call the imported `bridgeCommentRows` function.
2. `geelooy/api/social/helper/search/rag/test/commentHydrationGuard.test.js`
	- Rewrite completely and add a valid-coordinate bridge-path invocation so undefined source functions can never hide behind the early guard again.
3. Existing client files remain intact because they correctly render hydrated `hits[].comments` and conservatively merge future ranked `commentHits`.

## Verification Order

1. Syntax-check both rewritten files.
2. Run the hydration guard and bridge-comment tests.
3. Run the focused UI/UX regression test.
4. Restart or refresh the local server safely so CommonJS cache reloads.
5. Repeat the direct lane live query and require:
	- no `commentHydrationFallback`,
	- `commentsPresent: true`,
	- non-zero hydrated comment rows.
6. Repeat all-library query and verify comments survive lane merging.
7. Run header Games, profile menu, CSS quality, and diff hygiene gates.
8. Re-read every touched file and record the final delta.
