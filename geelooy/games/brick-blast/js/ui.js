// B"H

/**
 * The Great Aggregator of Interfaces.
 * Formerly a monolith, this module now serves as a gateway to the specialized
 * ministers of the user interface, preserving the ancient contracts (exports)
 * while delegating the work to cleaner, separated scrolls.
 */

export { toggleModal, showErrorModal } from './ui/common.js';
export { showScreen } from './ui/screens.js';
export { updateGameUI, animateValue } from './ui/game-ui.js';
export { populateLevelGrid, populateCustomLevelsList } from './ui/level-select.js';
export { populateStore, updatePerutaDisplay, upgradeLevelGetters, showInfoModal, showDebtCollector } from './ui/store-ui.js';
export { toggleInventoryPanel } from './ui/inventory.js';
export { renderEditorGrid } from './ui/editor-ui.js';