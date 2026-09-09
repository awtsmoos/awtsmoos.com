// B"H
// Boruch Hashem
// Blessed is He

import * as C from './constants.js';
import { drawBackground } from './backgroundDraw.js';
import { createBackgroundState, updateBackground } from './backgroundState.js';

/**
 * @file background.js
 * @description Small compatibility facade around detached Dove background state and drawing.
 * The Awtsmoos renews atmosphere without making the main game own clouds, waves, or sea life.
 */
let state = createBackgroundState(C.CANVAS_WIDTH, C.CANVAS_HEIGHT);

/** Rebuilds only ambient scenery for a new run or resized viewport. */
export function init() {
	state = createBackgroundState(C.CANVAS_WIDTH, C.CANVAS_HEIGHT);
}

/** Advances ambient state one frame. */
export function update() {
	updateBackground(state, C.CANVAS_WIDTH);
}

/** Draws the current ambient state. */
export function draw(context) {
	drawBackground(context, state, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);
}
