//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file compatibility2d-scene.js
 * @description Draws a bounded top-down Nitzotz arena for browsers that cannot
 * allocate WebGL, preserving spatial playability without touching simulation truth.
 *
 * Architectural invariants:
 * - The player remains centered while world coordinates project around it.
 * - Only nearby untaken objects are drawn and the draw count is strictly bounded.
 * - Gameplay-significant mass remains visible through object radius and color.
 * - Decorative fidelity is intentionally lower than the normal WebGL renderer.
 */

import {
	drawCompatibilityObject,
	drawCompatibilityPlayer,
	drawCompatibilityStatus
} from './compatibility2d-marks.js';

const MAX_VISIBLE_OBJECTS = 260;
const VIEW_RADIUS = 1500;
const GRID_WORLD_STEP = 200;

/**
 * Draw one compatibility frame from canonical world state.
 * @param {CanvasRenderingContext2D} context Active 2D context.
 * @param {HTMLCanvasElement} canvas Active backing canvas.
 * @param {object} world Canonical Nitzotz world, read without mutation.
 * @returns {void}
 */
export function drawCompatibilityScene(context, canvas, world) {
	const width = canvas.width;
	const height = canvas.height;
	const scale = Math.min(width, height) / VIEW_RADIUS;

	context.save();
	context.fillStyle = '#07121a';
	context.fillRect(0, 0, width, height);
	drawGrid(context, width, height, scale, world.player);
	drawObjects(context, width, height, scale, world);
	drawCompatibilityPlayer(context, width, height, scale, world.player);
	drawCompatibilityStatus(context, width, world);
	context.restore();
}

/** Draw a moving world grid so steering remains visually legible in fallback mode. */
function drawGrid(context, width, height, scale, player) {
	const centerX = width / 2;
	const centerY = height / 2;
	const spacing = GRID_WORLD_STEP * scale;
	const offsetX = mod(-player.x * scale, spacing);
	const offsetY = mod(-player.y * scale, spacing);

	context.strokeStyle = 'rgba(126, 220, 255, 0.11)';
	context.lineWidth = 1;
	context.beginPath();
	for (let x = offsetX; x <= width; x += spacing) {
		context.moveTo(x, 0);
		context.lineTo(x, height);
	}
	for (let y = offsetY; y <= height; y += spacing) {
		context.moveTo(0, y);
		context.lineTo(width, y);
	}
	context.stroke();
	context.fillStyle = 'rgba(255, 223, 108, 0.18)';
	context.fillRect(centerX - 1, 0, 2, height);
	context.fillRect(0, centerY - 1, width, 2);
}

/** Project nearby untaken arena objects around the centered player. */
function drawObjects(context, width, height, scale, world) {
	let drawn = 0;
	for (const object of world.level.objects) {
		if (object.taken || drawn >= MAX_VISIBLE_OBJECTS) {
			continue;
		}
		const dx = object.x - world.player.x;
		const dy = object.y - world.player.y;
		if (Math.abs(dx) > VIEW_RADIUS || Math.abs(dy) > VIEW_RADIUS) {
			continue;
		}
		drawCompatibilityObject(context, width, height, scale, object, dx, dy);
		drawn += 1;
	}
}

/** Return a positive remainder so the moving grid remains stable for negative coordinates. */
function mod(value, divisor) {
	const remainder = value % divisor;
	if (remainder < 0) {
		return remainder + divisor;
	}
	return remainder;
}
