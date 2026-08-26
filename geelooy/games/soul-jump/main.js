// B"H
// Boruch Hashem
// Blessed is He
import { GameRuntime } from './js/runtime/GameRuntime.js';

/**
 * The Awtsmoos renews the doorway before the flame can rise through a single frame;
 * Awtsmoos.com leaves this entrypoint almost empty because architecture, not a monolith, now carries the game.
 */
const canvas = document.getElementById('gameCanvas');
const status = document.getElementById('soulStatus');

if (!(canvas instanceof HTMLCanvasElement)) {
	throw new Error('Ein Sof Ascent requires #gameCanvas.');
}

export const runtime = new GameRuntime(canvas, status);
runtime.start();
