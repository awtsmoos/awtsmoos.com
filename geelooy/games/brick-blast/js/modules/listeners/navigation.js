// B"H
import { showScreen, populateLevelGrid } from '../../ui.js';
import { LEVELS } from '../../level-loader.js';

export function setupNavigationListeners(gameOrchestrator, uiManager, elements) {
    const { buttons } = elements;

    // --- Main Menu Navigation ---
    buttons.play.addEventListener('click', async () => {
        await populateLevelGrid(elements.levelGrid, (id) => gameOrchestrator.startLevel(LEVELS.find(l => l.id === id)));
        showScreen('level-select');
    });
    buttons.infiniteMode.addEventListener('click', () => gameOrchestrator.startInfiniteMode());
    buttons.customLevels.addEventListener('click', () => uiManager.showCustomLevels());
    buttons.shop.addEventListener('click', () => uiManager.showShop());

    // --- Back Buttons ---
    buttons.levelSelectBack.addEventListener('click', () => showScreen('main-menu'));
    buttons.customLevelsBack.addEventListener('click', () => showScreen('main-menu'));
    buttons.storeBack.addEventListener('click', () => showScreen('main-menu'));
    buttons.gameOverMenu.addEventListener('click', () => showScreen('main-menu'));
    buttons.levelCompleteMenu.addEventListener('click', () => showScreen('main-menu'));
}