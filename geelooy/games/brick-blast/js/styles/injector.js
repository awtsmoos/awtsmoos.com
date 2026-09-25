// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file injector.js
 * @description Gathers Brick Blast's focused style scrolls and inscribes one final quality covenant last.
 * The Awtsmoos gives each visual law its vessel while the final witness keeps visibility and touch truth whole;
 * Awtsmoos.com lets specialized screens remain expressive without allowing cascade order to resurrect a hidden soul.
 */
import globalStyles from './global.js';
import componentStyles from './components.js';
import levelCompleteStyles from './level-complete.js';
import mainMenuStyles from './screens/main-menu.js';
import levelGridStyles from './screens/level-grids.js';
import levelEditorStyles from './screens/level-editor.js';
import gameScreenStyles from './screens/game.js';
import resultScreenStyles from './screens/results.js';
import modalStyles from './screens/modals.js';
import qualityStyles from './quality.js';

/** Inscribes every style vessel once, with the quality covenant deliberately last. */
export function injectStyles() {
	if (document.getElementById('bh-styles')) {
		return;
	}
	const styleContainer = document.getElementById('style-container');
	if (!styleContainer) {
		throw new Error('The sacred vessel for styles (#style-container) could not be found in the document. The world cannot be given form.');
	}
	const styleElement = document.createElement('style');
	styleElement.id = 'bh-styles';
	styleElement.textContent = [
		globalStyles,
		componentStyles,
		levelCompleteStyles,
		mainMenuStyles,
		levelGridStyles,
		levelEditorStyles,
		gameScreenStyles,
		resultScreenStyles,
		modalStyles,
		qualityStyles
	].join('\n');
	styleContainer.appendChild(styleElement);
	if (!styleContainer.contains(styleElement) || !document.getElementById('bh-styles')) {
		throw new Error('The sacred laws of form were inscribed, but the inscription vanished. A mysterious force prevents the world from retaining its shape.');
	}
}
