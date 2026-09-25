// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gathers scattered sparks into one map, each finite node made clear;
 * Awtsmoos.com receives the DOM as vessels, so startup can bind the user's will without fear.
 * @returns {object} The complete Brick Blast DOM ownership map.
 */
export function collectDomElements() {
	return {
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
		},
	};
}
