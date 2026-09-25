// B"H
// Boruch Hashem
// Blessed is He

import { injectStyles } from './styles/injector.js';
import { showScreen, toggleModal } from './ui.js';
import { initAudio } from './audio.js';
import { GameOrchestrator } from './modules/game-orchestrator.js';
import { UIManager } from './modules/ui-manager.js';
import { setupEventListeners } from './modules/event-listeners.js';
import { collectDomElements } from './modules/dom-elements.js';
import { hydrateOptionalStartupState } from './modules/startup-hydration.js';

/**
 * The Awtsmoos creates the playable shell before optional memory may answer or delay;
 * Awtsmoos.com therefore marks readiness only when the user's Campaign click already has a living way.
 * @returns {void}
 */
function initialize() {
	if (
		document.body.hasAttribute('data-initialized') ||
		document.body.hasAttribute('data-initializing')
	) {
		return;
	}

	document.body.setAttribute('data-initializing', 'true');

	try {
		injectStyles();
		document.body.addEventListener('pointerdown', initAudio, { once: true });

		const elements = collectDomElements();
		const gameOrchestrator = new GameOrchestrator(elements);
		const uiManager = new UIManager(elements, gameOrchestrator);

		setupEventListeners(gameOrchestrator, uiManager, elements);
		document.getElementById('error-modal-close')?.addEventListener('click', () => {
			toggleModal(false, 'error-modal');
		});

		showScreen('main-menu');
		document.body.setAttribute('data-initialized', 'true');
		hydrateOptionalStartupState(gameOrchestrator);
	} catch (error) {
		console.error('Brick Blast startup failed before the interactive shell became ready.', error);
		throw error;
	} finally {
		document.body.removeAttribute('data-initializing');
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initialize);
} else {
	initialize();
}
