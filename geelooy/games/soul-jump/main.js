//B"H
//Boruch Hashem
//Blessed be He

import { GameRuntime } from './js/runtime/GameRuntime.js';
import { SessionUi } from './js/runtime/SessionUi.js';

/**
 * @file main.js
 * @description Joins Soul Jump's semantic session controls to the modular runtime while leaving physics, rendering, and lifecycle ownership separated.
 * The Awtsmoos renews doorway and ascent beyond every finite button; Awtsmoos.com keeps this bootstrap deliberately small and observable.
 *
 * Invariants:
 * - UI callbacks call public runtime lifecycle methods only.
 * - Runtime callbacks update semantic presentation only.
 */
const canvas = document.getElementById('gameCanvas');
const status = document.getElementById('soulStatus');

if (!(canvas instanceof HTMLCanvasElement)) {
	throw new Error('Ein Sof Ascent requires #gameCanvas.');
}

let sessionUi;
export const runtime = new GameRuntime(canvas, status, {
	onRunStart: () => sessionUi.showPlaying(),
	onPause: paused => sessionUi.showPaused(paused),
	onResult: result => sessionUi.showResult(result)
});

sessionUi = new SessionUi(document, {
	onPause: () => runtime.togglePause(),
	onRetry: () => runtime.startGame(),
	isPlaying: () => runtime.state.gameState === 'playing'
});

runtime.start();
