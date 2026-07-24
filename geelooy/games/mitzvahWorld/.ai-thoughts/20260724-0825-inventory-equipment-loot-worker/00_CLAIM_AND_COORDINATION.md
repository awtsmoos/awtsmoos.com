# B"H
# Boruch Hashem
# Blessed is He

## Worker claim

The Awtsmoos renews each worker without division, and Awtsmoos.com gives each finite hand a measured boundary. This worker claims only the inventory, equipment, weapon-attachment, corpse-loot, and target-frame contracts listed below.

### Claimed source files

- `experiments/Awtsmoos/src/gameplay/InventoryStore.js`
- `experiments/Awtsmoos/src/gameplay/InventoryStoreRules.js`
- `experiments/Awtsmoos/src/gameplay/InventoryPersistenceRules.js`
- `experiments/Awtsmoos/src/ui/InventoryPanel.js`
- `experiments/Awtsmoos/src/ui/InventoryPanelView.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEquipmentRuntime.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEquipmentNodes.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowWeaponAttachment.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyLoot.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowEnemyLifecycle.js`
- `experiments/Awtsmoos/src/ui/MinimalMeadowTargetFrame.js`
- `experiments/Awtsmoos/src/test/gameplay/inventoryEquipmentLoot.test.mjs` (new)

### Explicitly excluded concurrent files

Do not overwrite concurrent work in `MinimalMeadowEnemyActor.js`, `MinimalMeadowUi.js`, `MinimalMeadowCombat*.js`, `WorldTargetCoordinator.js`, house, tree, camera, water, player hydration, launcher, HTML, or CSS files.

### Coordination evidence

- Git status showed active edits in those excluded systems.
- No active mission room or recent explicit inventory claim was found.
- `missionRoomCreate` failed with `mission_not_found`.
- The tunnel-directed recovery action `missionNext8Plan` then failed inside Tunnel Control with `TypeError: FromGoal.create is not a function`.
- This durable claim therefore becomes the project-side coordination record.
