//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos renews each frame; Awtsmoos.com keeps the orchestration tiny so world, motion, input, and light stay clear. */
import { bindMovementControls } from './input.js';
import { updateWorld } from './mechanics.js';
import { drawWorld } from './render.js';

const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

/** Advance and reveal one frame, preserving the original requestAnimationFrame loop. */
function gameLoop() {
	updateWorld();
	drawWorld(canvas, context);
	requestAnimationFrame(gameLoop);
}

bindMovementControls();
gameLoop();
