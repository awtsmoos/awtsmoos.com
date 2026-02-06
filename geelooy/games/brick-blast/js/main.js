// B"H

import { injectStyles } from './styles/injector.js';
import { showScreen, updatePerutaDisplay, toggleModal } from './ui.js';
import { initAudio } from './audio.js';
import * as persistence from './persistence.js';
import { GameOrchestrator } from './modules/game-orchestrator.js';
import { UIManager } from './modules/ui-manager.js';
import { setupEventListeners } from './modules/event-listeners.js';

/**
 * The Awtsmoos, in His infinite wisdom, created a single point from which all existence flows.
 * This main function is that point for our application, the prime mover that sets all other things in motion.
 * It establishes the world and listens for the user's will to begin the great game.
 */
async function initialize() {
    // Guard to prevent this sacred initialization from running more than once.
    if (document.body.hasAttribute('data-initialized')) return;
    document.body.setAttribute('data-initialized', 'true');

    // The divine rite of awakening: warm the persistence cache before any other action.
    await persistence.loadInitialData();

    // The first act of creation is to give the world its form by invoking the Divine Scribe.
    injectStyles();

    // The divine gift of sound must be granted by the user's will.
    document.body.addEventListener('pointerdown', initAudio, { once: true });

    // The Master Map of all sacred interactive locations in the temple.
    const elements = {
      levelGrid: document.getElementById('level-grid'),
      customLevelList: document.getElementById('custom-level-list'),
      editorGrid: document.getElementById('editor-grid'),
      storeGrid: document.getElementById('store-grid'),
      highScoreDisplay: document.getElementById('high-score-display'),
      finalScore: document.getElementById('final-score'),
      penaltyAmount: document.getElementById('peruta-penalty-amount'),
      levelCompleteBonus: document.getElementById('level-complete-bonus'),
      perutaBonus: document.getElementById('peruta-bonus'),
      starRating: document.getElementById('star-rating'),
      turnReport: document.getElementById('turn-report'),
      levelNameInput: document.getElementById('level-name-input'),
      
      buttons: {
        play: document.getElementById('play-button'),
        infiniteMode: document.getElementById('infinite-mode-button'),
        customLevels: document.getElementById('custom-levels-button'),
        shop: document.getElementById('shop-button'),
        levelSelectBack: document.getElementById('level-select-back-button'),
        customLevelsBack: document.getElementById('custom-levels-back-button'),
        storeBack: document.getElementById('store-back-button'),
        newLevel: document.getElementById('new-level-button'),
        importLevel: document.getElementById('import-level-input'),
        editorBack: document.getElementById('editor-back-button'),
        saveLevel: document.getElementById('save-level-button'),
        aiGenerate: document.getElementById('ai-generate-button'),
        addRowAbove: document.getElementById('add-row-above-button'),
        eraser: document.getElementById('eraser-button'),
        brushHealthDisplay: document.getElementById('brush-health-display'),
        gameBack: document.getElementById('game-back-button'),
        inventory: document.getElementById('inventory-button'),
        restart: document.getElementById('restart-button'),
        gameOverMenu: document.getElementById('game-over-menu-button'),
        nextLevel: document.getElementById('next-level-button'),
        levelCompleteMenu: document.getElementById('level-complete-menu-button'),
      },

      healthTuner: {
        display: document.getElementById('health-tuner-display'),
        slider: document.getElementById('health-tuner-slider'),
        input: document.getElementById('health-tuner-input'),
        set: document.getElementById('health-tuner-set'),
        cancel: document.getElementById('health-tuner-cancel'),
        plus: document.getElementById('health-tuner-plus'),
        minus: document.getElementById('health-tuner-minus'),
      },
      
      ai: {
        providerSelect: document.getElementById('ai-provider-select'),
        modalTitle: document.getElementById('ai-modal-title'),
        keyEntryView: document.getElementById('ai-key-entry-view'),
        generateView: document.getElementById('ai-generate-view'),
        apiKeyLabel: document.getElementById('ai-api-key-label'),
        apiKeyInput: document.getElementById('ai-api-key-input'),
        apiKeyLink: document.getElementById('ai-key-link'),
        keySave: document.getElementById('ai-key-save'),
        keyForget: document.getElementById('ai-key-forget'),
        modelSelect: document.getElementById('ai-model-select'),
        modelLoader: document.getElementById('ai-model-loader'),
        status: document.getElementById('ai-status'),
        promptInput: document.getElementById('ai-prompt-input'),
        modalCancelKey: document.getElementById('ai-modal-cancel-key'),
        modalCancelGenerate: document.getElementById('ai-modal-cancel-generate'),
        modalGenerate: document.getElementById('ai-modal-generate'),
      }
    };
    
    // Instantiate the ministers
    const gameOrchestrator = new GameOrchestrator(elements);
    const uiManager = new UIManager(elements, gameOrchestrator);

    // Command the Scribe of Events to connect the ministers to the user's will, providing it the Master Map.
    setupEventListeners(gameOrchestrator, uiManager, elements);
    
    // A general listener for the new error modal.
    document.getElementById('error-modal-close').addEventListener('click', () => toggleModal(false, 'error-modal'));


    // --- Initial State ---
    const initialPerutas = await persistence.getPerutas();
    updatePerutaDisplay(initialPerutas);
    await gameOrchestrator.updateHighScoreDisplay();
    showScreen('main-menu');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}