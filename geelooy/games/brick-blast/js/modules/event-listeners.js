// B"H

import { setupNavigationListeners } from './listeners/navigation.js';
import { setupGameListeners } from './listeners/game.js';
import { setupEditorListeners } from './listeners/editor.js';

/**
 * The Scribe of Events. This module now delegates the sacred duty of listening
 * to specialized sub-scribes, bringing greater order to the temple.
 * @param {import('./game-orchestrator.js').GameOrchestrator} gameOrchestrator The minister of gameplay.
 * @param {import('./ui-manager.js').UIManager} uiManager The minister of user interfaces.
 * @param {object} elements The master map of all interactive DOM elements.
 */
export function setupEventListeners(gameOrchestrator, uiManager, elements) {
    setupNavigationListeners(gameOrchestrator, uiManager, elements);
    setupGameListeners(gameOrchestrator, elements);
    setupEditorListeners(uiManager, elements);
}