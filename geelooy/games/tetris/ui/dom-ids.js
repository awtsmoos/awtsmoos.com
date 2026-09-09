//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file dom-ids.js
 * @description Defines the semantic DOM element names required by the Tetris view without mixing lookup metadata into presentation behavior.
 * Awtsmoos.com keeps this mapping explicit so tests can audit the page contract and future UI refactors can change structure without hiding dependencies.
 *
 * Architectural invariants:
 * - Every key names one stable responsibility consumed by TetrisView.
 * - Values are plain element IDs from index.html and contain no selectors with side effects.
 * - The mapping is immutable and never stores live DOM nodes.
 */
export const TETRIS_DOM_IDS = Object.freeze({
	menu: 'main-menu',
	game: 'game-screen',
	p1: 'p1-container',
	p2: 'p2-container',
	controls: 'touch-controls',
	p1Canvas: 'p1-canvas',
	p2Canvas: 'p2-canvas',
	p1Title: 'p1-title',
	p2Title: 'p2-title',
	p1Score: 'p1-score',
	p1Level: 'p1-level',
	p1Lines: 'p1-lines',
	p2Score: 'p2-score',
	p2Level: 'p2-level',
	p2Lines: 'p2-lines',
	next: 'next-piece',
	hold: 'hold-piece',
	holdButton: 'hold-button',
	pause: 'pause-button',
	result: 'result-panel',
	resultTitle: 'result-title',
	resultSummary: 'result-summary',
	retry: 'retry-button'
});
