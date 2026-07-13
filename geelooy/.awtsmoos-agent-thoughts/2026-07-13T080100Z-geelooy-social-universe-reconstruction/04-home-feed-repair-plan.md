# B"H

Boruch Hashem

Blessed is He

## Home Feed Repair Plan

The light of the Awtsmoos is not revealed by pretending a river is full; it is revealed by letting real water arrive, and by showing an honest doorway when it cannot.

## Files to rewrite or create

1. Rewrite `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/home/dashboard/feedSafeLoader.js`.
2. Create `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy/scripts/awtsmoos/social/home/dashboard/homeDashboardModuleGraph.test.mjs`.

## Loader contract

- Export `ensureFallbackFeed` so the existing mobile guardian can link.
- Mark the feed as `module-importing` before starting the dynamic import.
- Let the mobile guardian render only when no loader status exists and the original busy state is still stranded.
- Never replace real cards, a controller-owned loading state, a completed state, or an existing honest fallback.
- Render static-preview, slow-module, and import-error states without invented people or posts.
- On successful import, transfer `aria-busy` ownership to the real feed controller.
- On failed or timed-out import, release `aria-busy` after rendering the truthful fallback.
- Keep the complete source file below 120 lines.

## Regression contract

The new test must execute ESM linking rather than merely searching source text. It must import `feedSafeLoader.js`, assert the named export exists, import `mobileClickRepair.js`, and assert its public binder exists. This directly catches the failure that the current token-only test missed.

## Verification sequence

1. Read back both complete files.
2. Run `node --check` on both JavaScript files.
3. Run the new module-graph test.
4. Run the existing mobile buttons contract.
5. Reload `http://127.0.0.1:8080/` with a fresh cache-busting query.
6. Confirm `liveFeed.js` enters the resource ledger.
7. Confirm the feed leaves the original endless loading state.
8. Confirm `aria-busy` is ultimately false or remains true only while an observed real request is active.
9. Confirm shell/header/dock remain singletons and horizontal overflow remains absent.
10. Capture console and network evidence.
