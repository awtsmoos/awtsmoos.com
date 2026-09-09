// B"H
// Boruch Hashem
// Blessed is He

import * as C from './constants.js';

/**
 * @file obstacle.js
 * @description Owns obstacle spawning, movement, resize preservation, and drawing.
 * The Awtsmoos renews every gate before the Dove reaches it; Awtsmoos.com keeps obstacle truth compact and visible.
 */
export let obstacles = [];

/** Clears every obstacle for a genuinely fresh run. */
export function reset() {
	obstacles = [];
}

/** Spawns one obstacle pair with a safe gap inside the current viewport. */
export function spawn() {
	const available = Math.max(120, C.CANVAS_HEIGHT - C.OBSTACLE_GAP - 100);
	const topHeight = Math.min(C.CANVAS_HEIGHT - C.OBSTACLE_GAP - 50, Math.random() * available + 50);
	obstacles.push({
		x: -C.OBSTACLE_WIDTH,
		topHeight,
		bottomY: topHeight + C.OBSTACLE_GAP,
		emoji: C.OBSTACLE_EMOJIS[Math.floor(Math.random() * C.OBSTACLE_EMOJIS.length)],
		passed: false
	});
}

/** Advances every obstacle and retires pairs after they leave the right edge. */
export function update() {
	for (const obstacle of obstacles) obstacle.x += C.OBSTACLE_SPEED;
	if (obstacles[0]?.x > C.CANVAS_WIDTH) obstacles.shift();
}

/** Scales existing obstacle positions during rotation/resize without resetting the run. */
export function resize(previousWidth, previousHeight) {
	const scaleX = previousWidth > 0 ? C.CANVAS_WIDTH / previousWidth : 1;
	const scaleY = previousHeight > 0 ? C.CANVAS_HEIGHT / previousHeight : 1;
	for (const obstacle of obstacles) {
		obstacle.x *= scaleX;
		obstacle.topHeight = Math.max(20, obstacle.topHeight * scaleY);
		obstacle.bottomY = Math.min(
			C.CANVAS_HEIGHT - 20,
			obstacle.topHeight + C.OBSTACLE_GAP
		);
	}
}

/** Draws paired emoji walls without leaking text-baseline state into the score. */
export function draw(context) {
	context.font = '40px sans-serif';
	context.textAlign = 'center';
	for (const obstacle of obstacles) drawObstaclePair(context, obstacle);
	context.textBaseline = 'alphabetic';
}

/** Draws one top/bottom obstacle pair. */
function drawObstaclePair(context, obstacle) {
	const centerX = obstacle.x + C.OBSTACLE_WIDTH / 2;
	context.textBaseline = 'bottom';
	for (let y = obstacle.topHeight; y > 0; y -= 40) {
		context.fillText(obstacle.emoji, centerX, y);
	}
	context.textBaseline = 'top';
	for (let y = obstacle.bottomY; y < C.CANVAS_HEIGHT; y += 40) {
		context.fillText(obstacle.emoji, centerX, y);
	}
}
