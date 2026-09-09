// B"H
// Boruch Hashem
// Blessed is He

import * as C from './constants.js';

/**
 * @file dove.js
 * @description Owns only Dove motion and drawing; lifecycle and score remain elsewhere.
 * The Awtsmoos renews the living wing beyond velocity and coordinate; Awtsmoos.com keeps one bird-state vessel clear.
 */
export let y = C.DOVE_START_Y();
export let velocity = 0;

const doveImage = new Image();
doveImage.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕊️</text></svg>';

/** Gives the Dove one upward impulse. */
export function flap() {
	velocity = C.LIFT;
}

/** Restores the Dove to the canonical beginning of a fresh run. */
export function reset() {
	y = C.DOVE_START_Y();
	velocity = 0;
}

/** Keeps the current run inside a resized playfield without resetting progress. */
export function constrainToViewport() {
	y = Math.min(
		Math.max(y, C.DOVE_RADIUS),
		Math.max(C.DOVE_RADIUS, C.CANVAS_HEIGHT - C.DOVE_RADIUS)
	);
}

/** Advances gravity and clamps only the upper flight boundary. */
export function update() {
	velocity += C.GRAVITY;
	y += velocity;
	if (y < C.DOVE_RADIUS) {
		y = C.DOVE_RADIUS;
		velocity = 0;
	}
}

/** Draws the Dove with velocity-driven pitch while preserving canvas state. */
export function draw(context) {
	const rotation = Math.max(-Math.PI / 6, Math.min(Math.PI / 4, velocity * 0.05));
	context.save();
	context.translate(C.DOVE_START_X(), y);
	context.rotate(rotation);
	context.drawImage(doveImage, -C.DOVE_WIDTH / 2, -C.DOVE_HEIGHT / 2, C.DOVE_WIDTH, C.DOVE_HEIGHT);
	context.restore();
}
