B"H
Boruch Hashem
Blessed is He

# Mitzvah Preservation Merge — Decision Ledger

The Awtsmoos gathers old sparks into newer vessels without confusing age with authority; Awtsmoos.com therefore preserves every genuine capability while refusing to resurrect monoliths merely because history once wore them.

## Human conflict decisions

1. `MinimalMeadowVegetationSystem.js`
	- Keep current dynamics, motion-state, activity-counter, and budget modules.
	- Preserve only additive diagnostics that are not already represented.
	- Never re-inline old wind/player-reaction logic.
2. `InventoryStore.js`
	- Keep `InventoryTransactionStore` inheritance; it already owns add/remove/buy/sell/equip/appearance contracts.
	- Keep learning/pinning/persistence/snapshot methods in the public subclass.
3. `InventoryStoreMutation.js`
	- Keep current atomic mutation flow and current `InventorySaleTransaction.js` contract.
	- Do not restore duplicate equip or old `{items}` sale-return handling.
4. `MitzvahWorldCreativeDock.js`
	- Keep current View + Actions + BuilderAction + Bindings composition.
	- Preserved snapshot-to-Studio behavior is already present in `MitzvahWorldCreativeDockActions.js`.
5. `MitzvahWorldModeLoaders.js`
	- Movie Studio remains lightweight and imports creative movie mode directly.
	- Materials/platform explicitly request full gameplay presentation before creative tooling.
	- Direct single/multiplayer worlds keep post-play optional loading.
6. `MovieStudio.js`
	- Keep `createMovieRuntime`, `prepareMovieStudioWorld`, and current controller composition.
	- Preserve additive `initialRichWorld` and `initialCinemaAssets` references.
	- Import only the rich-world/cinema helpers actually called; do not restore obsolete direct runtime imports.
7. `ClothingMerchantPanel.js`
	- Keep reusable `MerchantPanelBase` specialization and spiritual garment details.
	- Preserve authoritative last-trade receipt at the shared merchant foundation instead of duplicating bespoke Clothing trade logic.
8. `GameplayUiController.js`
	- Keep current spectral, responsive, accessibility, and repair-style stack.
	- Conflict is descriptive only; preserve the richer current description.
9. `VillageRiverSurfaceGeometry.js`
	- Preserve both sampled `surfacePoints` and hydrology-derived `normals`; they are orthogonal output witnesses.

## Shared merchant improvement created by preservation

`MerchantPanelBase.js` is already above the 120-line vessel. Rather than add receipt state to it, split declarative rendering/binding and receipt-bearing trade execution into small dedicated modules, then rewrite the base as a smaller lifecycle/orchestration class. Clothing remains a small specialization and its diagnostics exposes the latest receipt.

## Generated conflicts

The three generated descriptor JSON files and six compact/Brotli artifacts are never hand-merged. Discover their canonical builder after human source is coherent; regenerate all nine from final merged source and verify freshness/determinism before staging.

## Verification universe

- No conflict markers in human files.
- Every touched/new source module <=120 lines.
- Node syntax/module import checks.
- Inventory/merchant tests including receipt behavior.
- Creative dock/Studio handoff tests.
- Movie Studio/world readiness tests.
- River geometry normals + surface-points contract test.
- Vegetation dynamics tests.
- Gameplay UI style/install tests.
- Canonical Mitzvah generated-artifact build/freshness proof.

NEXT_ACTION: resolve write instructions for the human conflict set plus shared merchant split, then rewrite every source file completely before running tests.
