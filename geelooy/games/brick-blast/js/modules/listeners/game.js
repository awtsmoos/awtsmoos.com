// B"H

export function setupGameListeners(gameOrchestrator, elements) {
    const { buttons } = elements;

    // --- In-Game and Post-Game Controls ---
    buttons.gameBack.addEventListener('click', () => {
        // Trigger the theme-consistent forfeit modal
        gameOrchestrator.requestResign();
    });
    buttons.restart.addEventListener('click', () => gameOrchestrator.restartLevel());
    buttons.inventory.addEventListener('click', () => gameOrchestrator.toggleInventory(true));
    buttons.nextLevel.addEventListener('click', () => gameOrchestrator.startNextLevel());
}