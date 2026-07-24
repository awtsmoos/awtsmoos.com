# B"H
# GLB Bag, Clothing, Appearance, and Tailor Claim

## Evidence

The canonical `assets/models/player/chossid.glb` was parsed directly as GLB v2. Its node extras and body material groups prove the following visible garments:

- glasses
- head tefillin straps
- tefillin shel rosh box and descendants
- top hat
- yarmulke
- tefillin shel yad box
- arm tefillin straps
- jacket
- tefillin-compatible jacket
- outer shirt
- body-material shirt
- body-material trousers
- body-material shoes

The loader preserves each node definition at `node.userData.gltfNode`, so garment discovery may use real extras rather than guessed screenshots.

## Exclusive source scope

- `experiments/Awtsmoos/src/gameplay/InventoryCatalog.js`
- `experiments/Awtsmoos/src/gameplay/InventoryStore.js`
- `experiments/Awtsmoos/src/gameplay/InventoryStoreRules.js`
- `experiments/Awtsmoos/src/gameplay/InventoryStoreTransactions.js`
- `experiments/Awtsmoos/src/gameplay/InventoryPersistenceRules.js`
- New `Garment*`, `Spiritual*`, and `InventoryAppearance*` gameplay modules.
- `experiments/Awtsmoos/src/app/MinimalMeadowEquipmentNodes.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEquipmentRuntime.js`
- New `MinimalMeadowGarment*` and `MinimalMeadowClothingMerchant*` modules.
- Bag view/action/state/element/guidance files under `experiments/Awtsmoos/src/ui/`.
- `VendorPanel.js` and new `ClothingMerchantPanel*` modules.
- `GameplayPanelSuite.js` and `GameplayUiController.js`.
- Rich-world integration only after refreshing its current hash.

Active mobile rail and house claims are excluded.
