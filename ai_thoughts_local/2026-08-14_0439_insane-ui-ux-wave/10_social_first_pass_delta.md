B"H
Boruch Hashem
Blessed is He

# Social First-Pass Delta → Refinement Pass

> The Awtsmoos does not call a vessel complete merely because it stands below a numerical ceiling. A living architecture leaves room to breathe, test, and evolve.

## Original obligations remembered
- Bulk Social exploration must be read-only by construction.
- Exactly five proven HTTP mutations must require explicit individual intent.
- Raw JSON must remain available but no longer dominate ordinary reading.
- `/social/` must remain useful before JavaScript completes.
- Every source module must stay below 120 lines, with smaller modules preferred.
- No API payload/signature changes.

## What pass one actually wrote
- `operationPolicy.js`: immutable read/mutation classification.
- `requestFactory.js`: existing API request construction extracted from planning.
- `requestPlan.js`: read-only panel/all expansion plus separate mutation grouping.
- `resultDigest.js`: human-first summaries.
- `renderConfig.js`: read cards and mutation cards physically separated.
- `renderCards.js`: Explore/Act cards, consequence copy, retry, Advanced raw evidence.
- `renderMarkup.js`: context/rail/hero composition.
- `render.js`: separate retry/read/mutation delegated events.
- `index.js`: runtime enforcement; startup and bulk paths call reads only.
- `/social/index.html`: resilient preboot/no-JS experience.
- `safety.css` and `results.css`, imported from the existing Social style gateway.

## Reread evidence
- `operationPolicy.js` 103 lines.
- `requestFactory.js` 95 lines.
- `requestPlan.js` 52 lines.
- `resultDigest.js` 117 lines.
- `renderConfig.js` 99 lines.
- `renderCards.js` 102 lines.
- `renderMarkup.js` 68 lines.
- `render.js` 92 lines.
- `index.js` 119 lines.
- `social/index.html` 54 lines.
- `safety.css` 88 lines.
- `results.css` 117 lines.

## Delta that must be repaired before tests
1. `index.js` at 119 lines has no architectural headroom. Extract WebSocket connect/publish behavior into `liveActions.js`.
2. `resultDigest.js` at 117 lines should split preview/scalar helpers into `resultPreview.js`.
3. `results.css` at 117 lines should split preboot styling into `preboot.css`.
4. Pure bulk-operation grouping should move into `operationGroups.js`, independent of browser/API state, so safety tests can import the complete grouping model directly.
5. `requestPlan.js` should consume/re-export the pure grouping helpers and keep request execution separate.
6. Add a mutation-leak sentinel test proving every group and all-keys universe excludes all five mutations.
7. Add a policy exhaustiveness test proving the five API POST operations are classified as mutations and key read operations remain reads.
8. Only after these refinements should syntax/tests begin.

## Second-pass sequence
A. Create `operationGroups.js`, `liveActions.js`, `resultPreview.js`, `preboot.css`.
B. Rewrite `requestPlan.js`, `resultDigest.js`, `index.js`, `results.css`, style gateway as needed.
C. Discover the project’s appropriate Social test location and add a focused contract test.
D. Reread all first- and second-pass Social files.
E. Then run syntax/tests and browser verification.
